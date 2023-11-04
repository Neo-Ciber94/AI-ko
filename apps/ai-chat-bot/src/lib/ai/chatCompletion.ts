import {
  conversationMessages,
  messageImageContents,
  messageTextContents,
} from "../database/schema";
import { type Stream } from "openai/streaming.mjs";
import type {
  ChatCompletionCreateParams,
  ChatCompletionChunk,
  ChatCompletionMessageParam,
} from "openai/resources/index.mjs";
import { db } from "../database";
import {
  HEADER_ASSISTANT_MESSAGE_ID,
  HEADER_USER_MESSAGE_ID,
} from "../common/constants";
import { openaiInstance } from ".";
import type { Role } from "../database/types";
import { generateImage } from "./generateImage";
import { getSession } from "../auth/utils";

type ImageContent = {
  type: "image";
  imageUrl: string;
  imagePrompt: string;
};

type TextContent = {
  type: "text";
  text: string;
};

type MessageContent = ImageContent | TextContent;

type Message = {
  role: Role;
  contents: MessageContent[];
};

type ChatCompletionInput = {
  conversationId: string;
  model: "gpt-3.5-turbo" | "gpt-4";
  newMessage: { content: string };
  messages: Message[];
};

type GeneratedMessage =
  | {
      type: "text";
      content: string;
    }
  | {
      type: "image";
      images: {
        imageUrl: string;
        imagePrompt: string;
      }[];
    };

const FUNCTIONS = {
  generateImage: {
    name: "generateImage",
    description:
      "Generate an image using a text prompt, the prompt should be long descriptive and detailed",
    parameters: {
      type: "object",
      properties: {
        imagePrompt: {
          type: "string",
          description:
            "A descriptive and detailed prompt used to generate the image",
        },
      },
    },
  },
} satisfies Record<string, ChatCompletionCreateParams.Function>;

type FunctionCall = keyof typeof FUNCTIONS;

type ChatCompletionOptions = {
  input: ChatCompletionInput;
  signal?: AbortSignal;
};

export async function chatCompletion({ input, signal }: ChatCompletionOptions) {
  const messages: ChatCompletionMessageParam[] = input.messages
    .filter((x) => x.contents.length > 0)
    .filter((x) => !x.contents.some((x) => x.type !== "text"))
    .map((x) => {
      const contents = x.contents[0];

      switch (contents.type) {
        case "text": {
          return {
            content: contents.text,
            role: x.role,
          } as ChatCompletionMessageParam;
        }
        case "image": {
          return {
            role: "function",
            name: "generateImage",
            content: JSON.stringify({ imagePrompt: contents.imagePrompt }),
          } as ChatCompletionMessageParam;
        }
      }
    })
    // Add the new message
    .concat({
      content: input.newMessage.content,
      role: "user",
    });

  const userMessageId = crypto.randomUUID();
  const assistantMessageId = crypto.randomUUID();

  // Save the new user message to the db
  await db.transaction(async (tx) => {
    const userConversationMessage = await tx
      .insert(conversationMessages)
      .values({
        id: userMessageId,
        conversationId: input.conversationId,
        role: "user",
      })
      .returning();

    await tx.insert(messageTextContents).values({
      text: input.newMessage.content,
      conversationMessageId: userConversationMessage[0].id,
    });
  });

  const openAIStream = await openaiInstance.chat.completions.create({
    messages,
    stream: true,
    model: input.model,
    function_call: "auto",
    functions: Object.values(FUNCTIONS),
  });

  const response = createResponseStream({
    signal,
    openAIStream,
    async onGenerate(generated) {
      switch (generated.type) {
        case "text": {
          await db.transaction(async (tx) => {
            // Save the AI message to the db
            const assistantConversationMessage = await tx
              .insert(conversationMessages)
              .values({
                id: assistantMessageId,
                conversationId: input.conversationId,
                role: "assistant",
              })
              .returning();

            await tx.insert(messageTextContents).values({
              text: generated.content,
              conversationMessageId: assistantConversationMessage[0].id,
            });
          });
          break;
        }
        case "image": {
          // Save the generated images
          await db.transaction(async (tx) => {
            // Save the AI message to the db
            const assistantConversationMessage = await tx
              .insert(conversationMessages)
              .values({
                id: assistantMessageId,
                conversationId: input.conversationId,
                role: "assistant",
              })
              .returning();

            // TODO: Use Promise.all
            for (const img of generated.images) {
              await tx.insert(messageImageContents).values({
                imagePrompt: img.imagePrompt,
                imageUrl: img.imageUrl,
                conversationMessageId: assistantConversationMessage[0].id,
              });
            }
          });
          break;
        }
        default:
          throw new Error("Unknown generated type");
      }
    },
  });

  // Set ids in the headers
  response.headers.set(HEADER_ASSISTANT_MESSAGE_ID, assistantMessageId);
  response.headers.set(HEADER_USER_MESSAGE_ID, userMessageId);
  return response;
}

export type ChatEventMessage =
  | {
      type: "text";
      chunk: string;
    }
  | {
      type: "image";
      imageUrl: string;
      imagePrompt: string;
    }
  | {
      type: "error";
      message: string;
    }
  | {
      type: "is_calling_function";
    };

function createResponseStream({
  signal,
  openAIStream,
  onGenerate,
}: {
  signal?: AbortSignal;
  openAIStream: Stream<ChatCompletionChunk>;
  onGenerate: (generated: GeneratedMessage) => void;
}) {
  const encoder = new TextEncoder();
  let data: string = "";
  let done = false;
  let currentFunction: FunctionCall | undefined = undefined;

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (msg: ChatEventMessage) => {
        const json = JSON.stringify(msg);
        controller.enqueue(encoder.encode(`data: ${json}\n\n`));
      };

      if (signal) {
        signal.addEventListener("abort", () => {
          done = true;
          controller.close();
        });
      }

      for await (const chunk of openAIStream) {
        if (done) {
          return;
        }

        const choice = chunk.choices[0];
        const isStopped =
          choice == null ||
          choice.finish_reason === "stop" ||
          choice.finish_reason === "function_call";

        if (isStopped) {
          try {
            if (currentFunction === "generateImage") {
              const images = await generateImageForChatCompletion({
                data,
                emit,
              });
              onGenerate({ type: "image", images });
            } else {
              onGenerate({ type: "text", content: data });
            }
          } catch (err) {
            console.error(err);
            emit({ type: "error", message: "Failed to send stream" });
          } finally {
            controller.close();
          }

          return; // we should exit anyways
        } else {
          if (choice.delta.function_call) {
            const f = choice.delta.function_call;

            if (currentFunction) {
              data += f.arguments || "";
            } else {
              if (f.name === FUNCTIONS.generateImage.name) {
                currentFunction = FUNCTIONS.generateImage.name as FunctionCall;
                data += f.arguments || "";
                emit({ type: "is_calling_function" });
              } else {
                emit({ type: "error", message: "Failed to call function" });
                controller.close();
              }
            }
          } else {
            const chunk = choice.delta.content || "";
            data += chunk;
            emit({ type: "text", chunk });
          }
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
    },
  });
}

type EmitFunction = (msg: ChatEventMessage) => void;

async function generateImageForChatCompletion({
  data,
  emit,
}: {
  data: string;
  emit: EmitFunction;
}) {
  const args = JSON.parse(data || "{}") as {
    imagePrompt?: string;
  };

  const imagePrompt = args.imagePrompt;
  if (imagePrompt == null) {
    throw new Error("No prompt was provided");
  }

  const session = await getSession();
  const images = await generateImage({
    prompt: imagePrompt,
    userId: session?.user.userId,
  });

  if (images.length === 0) {
    throw new Error("No images were generated");
  }

  const generatedImages = images.map(({ imageUrl }) => ({
    imagePrompt,
    imageUrl,
  }));

  for (const img of generatedImages) {
    emit({ type: "image", ...img });
  }

  return generatedImages;
}
