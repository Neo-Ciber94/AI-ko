import { chatCompletion } from "@/lib/ai/chatCompletion";
import { json } from "@/lib/server/functions";
import { type NextRequest } from "next/server";
import z from "zod";

export const runtime = "edge";

const input = z.object({
  messages: z.array(
    z.object({
      id: z.string(),
      content: z.string(),
      role: z.enum(["user", "system"]),
    }),
  ),
  conversationId: z.string(),
  model: z.enum(["gpt-3.5-turbo", "gpt-4"]),
});

export type ChatInput = z.infer<typeof input>;

export async function POST(req: NextRequest) {
  const result = input.safeParse(await req.json());

  if (result.success) {
    const { data } = result;
    return chatCompletion(data);
  } else {
    const message = result.error.message;
    return json({ message }, { status: 400 });
  }
}
