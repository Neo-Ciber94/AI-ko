import { chatCompletion } from "@/lib/ai/chatCompletion";
import { json } from "@/lib/server/functions";
import { type NextRequest } from "next/server";
import z from "zod";

export const runtime = "edge";

const messageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("text"),
    text: z.string(),
  }),
  z.object({
    type: z.literal("image"),
    imageUrl: z.string(),
    imagePrompt: z.string(),
  }),
]);

const inputSchema = z.object({
  conversationId: z.string(),
  model: z.enum(["gpt-3.5-turbo", "gpt-4"]),
  newMessage: z.object({
    content: z.string(),
  }),
  messages: z.array(
    z.object({
      id: z.string(),
      role: z.enum(["user", "assistant"]),
      contents: z.array(messageSchema),
    }),
  ),
});

export type ChatInput = z.infer<typeof inputSchema>;

export async function POST(req: NextRequest) {
  const result = inputSchema.safeParse(await req.json());

  // TODO: Moderate input
  if (result.success) {
    const { data } = result;
    const response = await chatCompletion(data);
    return response;
  } else {
    const message = result.error.message;
    return json({ message }, { status: 400 });
  }
}
