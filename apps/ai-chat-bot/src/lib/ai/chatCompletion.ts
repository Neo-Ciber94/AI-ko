import { type InferSelectModel } from "drizzle-orm";
import { type conversationMessages } from "../database/schema";
import { type Stream } from "openai/streaming.mjs";
import { type ChatCompletionChunk } from "openai/resources/index.mjs";
import { env } from "../env";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

type Message = Pick<
  InferSelectModel<typeof conversationMessages>,
  "id" | "content" | "role"
>;

type ChatCompletionInput = {
  messages: Message[];
  conversationId: string;
  model: "gpt-3.5-turbo" | "gpt-4";
};

export async function chatCompletion(input: ChatCompletionInput) {
  const messages = input.messages.map((x) => ({
    content: x.content,
    role: x.role,
  }));

  const openAIStream = await openai.chat.completions.create({
    stream: true,
    model: input.model,
    messages,
  });

  const response = createResponseStream({
    openAIStream,
    onDone(message) {
      console.log(message);
    },
  });

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
