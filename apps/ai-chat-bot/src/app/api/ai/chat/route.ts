import { env } from "@/lib/env";
import { json } from "@/lib/server/functions";
import { OpenAIStream } from "@/lib/server/open-ai-stream";
import { type NextRequest } from "next/server";
import OpenAI from "openai";
import z from "zod";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

const input = z.object({
  messages: z.array(
    z.object({
      id: z.string(),
      content: z.string(),
      role: z.enum(["user", "system"]),
    }),
  ),
  model: z.enum(["gpt-3.5-turbo", "gpt-4"]),
});

export type ChatInput = z.infer<typeof input>;

export async function POST(req: NextRequest) {
  const result = input.safeParse(await req.json());

  if (result.success) {
    const { data } = result;

    const messages = data.messages.map((x) => ({
      content: x.content,
      role: x.role,
    }));

    console.log({ messages });
    const response = await openai.chat.completions.create({
      stream: true,
      model: data.model,
      messages,
    });

    return OpenAIStream(response);
  } else {
    const message = result.error.message;
    return json({ message }, { status: 400 });
  }
}
