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

export async function chatCompletion(input: ChatCompletionInput) {
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
    };

function createResponseStream({
  openAIStream,
  onGenerate,
}: {
  openAIStream: Stream<ChatCompletionChunk>;
  onGenerate: (generated: GeneratedMessage) => void;
}) {
  let data: string = "";
  let currentFunction: FunctionCall | undefined = undefined;

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (msg: ChatEventMessage) => {
        const json = JSON.stringify(msg);
        controller.enqueue(`data: ${json}\n\n`);
      };

      for await (const chunk of openAIStream) {
        const choice = chunk.choices[0];
        const isDone =
          choice == null ||
          choice.finish_reason === "stop" ||
          choice.finish_reason === "function_call";

        if (isDone) {
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
            console.log({ choice });

            if (currentFunction) {
              data += f.arguments || "";
            } else {
              if (f.name === FUNCTIONS.generateImage.name) {
                currentFunction = FUNCTIONS.generateImage.name as FunctionCall;
                data += f.arguments || "";
                console.log("Generating image: ", choice.delta.function_call);
              } else {
                emit({ type: "error", message: "Failed to call function" });
                controller.close();
              }
            }
          } else {
            const content = choice.delta.content || "";
            data += content;

            emit({
              type: "text",
              chunk: content,
            });
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
  console.log({ args: data });
  const args = JSON.parse(data || "{}") as {
    imagePrompt?: string;
  };

  const imagePrompt = args.imagePrompt;
  if (imagePrompt == null) {
    throw new Error("No prompt was provided");
  }

  // TODO: Add userId
  const { images } = await generateImage({ prompt: imagePrompt });
  if (images.length === 0) {
    throw new Error("No images were generated");
  }

  const generatedImages = images.map((img) => ({ imagePrompt, imageUrl: img }));

  for (const img of generatedImages) {
    emit({ type: "image", ...img });
  }

  return generatedImages;
}
