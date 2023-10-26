import { type InferSelectModel } from "drizzle-orm";
import { conversationMessages } from "../database/schema";
import { type Stream } from "openai/streaming.mjs";
import { type ChatCompletionChunk } from "openai/resources/index.mjs";
import { env } from "../env";
import OpenAI from "openai";
import { db } from "../database";
import {
  HEADER_SYSTEM_MESSAGE_ID,
  HEADER_USER_MESSAGE_ID,
} from "../common/constants";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

type Message = Pick<
  InferSelectModel<typeof conversationMessages>,
  "content" | "role"
>;

type ChatCompletionInput = {
  conversationId: string;
  model: "gpt-3.5-turbo" | "gpt-4";
  newMessage: { content: string };
  messages: Message[];
};

export async function chatCompletion(input: ChatCompletionInput) {
  const messages = input.messages
    .map((x) => ({
      content: x.content,
      role: x.role,
    }))
    // Add the new message
    .concat({
      content: input.newMessage.content,
      role: "user",
    });

  const userMessageId = crypto.randomUUID();
  const systemMessageId = crypto.randomUUID();

  // Save the new user message to the db
  await db
    .insert(conversationMessages)
    .values({
      id: userMessageId,
      content: input.newMessage.content,
      conversationId: input.conversationId,
      role: "user",
    })
    .returning();

  const openAIStream = await openai.chat.completions.create({
    stream: true,
    model: input.model,
    messages,
  });

  const response = createResponseStream({
    openAIStream,
    async onDone(aiMessage) {
      console.log({ aiMessage });

      // Save the AI message to the db
      await db.insert(conversationMessages).values({
        id: systemMessageId,
        content: aiMessage,
        conversationId: input.conversationId,
        role: "system",
      });
    },
  });

  // Set ids in the headers
  response.headers.set(HEADER_SYSTEM_MESSAGE_ID, systemMessageId);
  response.headers.set(HEADER_USER_MESSAGE_ID, userMessageId);
  return response;
}

function createResponseStream({
  openAIStream,
  onDone,
}: {
  openAIStream: Stream<ChatCompletionChunk>;
  onDone: (message: string) => void;
}) {
  let message: string = "";
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of openAIStream) {
        const choice = chunk.choices[0];

        if (choice == null || choice.finish_reason === "stop") {
          onDone(message);
          controller.close();
          return;
        }

        const content = choice.delta.content || "";
        message += content;
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
