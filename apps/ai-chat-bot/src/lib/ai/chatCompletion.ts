import { type InferSelectModel } from "drizzle-orm";
import { conversationMessages, messageContents } from "../database/schema";
import { type Stream } from "openai/streaming.mjs";
import { type ChatCompletionChunk } from "openai/resources/index.mjs";
import { db } from "../database";
import {
  HEADER_ASSISTANT_MESSAGE_ID,
  HEADER_USER_MESSAGE_ID,
} from "../common/constants";
import { openaiInstance } from ".";
import { type Role } from "../actions/conversationMessages";

type MessageContent = InferSelectModel<typeof messageContents>;
type MessageType = MessageContent["type"];

type Message = {
  role: Role;
  contents: {
    type: MessageType;
    data: string;
  }[];
};

type ChatCompletionInput = {
  conversationId: string;
  model: "gpt-3.5-turbo" | "gpt-4";
  newMessage: { content: string };
  messages: Message[];
};

export async function chatCompletion(input: ChatCompletionInput) {
  const messages = input.messages
    .filter((x) => x.contents.length > 0)
    .map((x) => {
      // We already check we had at least one message content
      const content = x.contents[0].data || "";
      return {
        content,
        role: x.role,
      };
    })
    // Add the new message
    .concat({
      content: input.newMessage.content,
      role: "user",
    });

  const userMessageId = crypto.randomUUID();
  const assistantMessageId = crypto.randomUUID();

  // Save the new user message to the db
  const userConversationMessage = await db
    .insert(conversationMessages)
    .values({
      id: userMessageId,
      conversationId: input.conversationId,
      role: "user",
    })
    .returning();

  await db.insert(messageContents).values({
    type: "text",
    data: input.newMessage.content,
    conversationMessageId: userConversationMessage[0].id,
  });

  const openAIStream = await openaiInstance.chat.completions.create({
    stream: true,
    model: input.model,
    messages,
  });

  const response = createResponseStream({
    openAIStream,
    async onDone({ type, data }) {
      if (type === "image") {
        throw new Error("Unimplemented");
      }

      // Save the AI message to the db
      const assistantConversationMessage = await db
        .insert(conversationMessages)
        .values({
          id: assistantMessageId,
          conversationId: input.conversationId,
          role: "assistant",
        })
        .returning();

      await db.insert(messageContents).values({
        type: "text",
        data,
        conversationMessageId: assistantConversationMessage[0].id,
      });
    },
  });

  // Set ids in the headers
  response.headers.set(HEADER_ASSISTANT_MESSAGE_ID, assistantMessageId);
  response.headers.set(HEADER_USER_MESSAGE_ID, userMessageId);
  return response;
}

type AIMessage = {
  type: MessageType;
  data: string;
};

function createResponseStream({
  openAIStream,
  onDone,
}: {
  openAIStream: Stream<ChatCompletionChunk>;
  onDone: (message: AIMessage) => void;
}) {
  let data: string = "";
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of openAIStream) {
        const choice = chunk.choices[0];

        if (choice == null || choice.finish_reason === "stop") {
          onDone({ type: "text", data });
          controller.close();
          return;
        }

        const content = choice.delta.content || "";
        data += content;
        controller.enqueue(content);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
    },
  });
}
