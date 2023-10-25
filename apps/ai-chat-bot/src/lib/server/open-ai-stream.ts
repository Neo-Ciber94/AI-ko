import { type Stream } from "openai/streaming.mjs";
import { type ChatCompletionChunk } from "openai/resources/index.mjs";

export function OpenAIStream(response: Stream<ChatCompletionChunk>) {
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of response) {
        const choice = chunk.choices[0];

        if (choice == null || choice.finish_reason === "stop") {
          controller.close();
          return;
        }

        const content = choice.delta.content || "";
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
