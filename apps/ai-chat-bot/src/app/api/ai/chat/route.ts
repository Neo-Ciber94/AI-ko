import { chatCompletion } from "@/lib/ai/chatCompletion";
import { moderateInput } from "@/lib/ai/moderateInput";
import { getSession } from "@/lib/auth/utils";
import { AIModel } from "@/lib/database/types";
import { json } from "@/lib/server/functions";
import { ratelimit } from "@/lib/server/rateLimiter";
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
  model: z.enum(["gpt-3.5-turbo", "gpt-4"] satisfies [AIModel, ...AIModel[]]),
  newMessage: z
    .object({
      content: z.string(),
    })
    .optional(),
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
  const session = await getSession();

  if (session == null || !session.user.isAuthorized) {
    return json({ message: "Forbidden" }, { status: 403 });
  }

  const rateLimiterResult = await ratelimit.limit(session.user.userId, req);
  if (!rateLimiterResult.success) {
    console.warn({
      userId: session.user.userId,
      rateLimited: rateLimiterResult,
    });
    return json({ message: "Too many requests" }, { status: 429 });
  }

  const result = inputSchema.safeParse(await req.json());

  if (result.success) {
    const { data: input } = result;

    if (input.newMessage) {
      if (!(await moderateInput(input.newMessage.content))) {
        return json(
          { message: "The user message violates the usage policy" },
          { status: 400 },
        );
      }
    }

    // When we try to regenerate we must ensure the last message is from the user
    if (input.newMessage == null) {
      const lastMessage = input.messages.at(-1);
      if (lastMessage && lastMessage.role !== "user") {
        return json(
          {
            message:
              "Can only regenerate chat when the last message is from the user",
          },
          { status: 400 },
        );
      }
    }

    const response = await chatCompletion({ input, signal: req.signal });
    return response;
  } else {
    const message = result.error.message;
    return json({ message }, { status: 400 });
  }
}
