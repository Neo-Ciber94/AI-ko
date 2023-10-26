"use server";

import { db } from "@/lib/database";
import { getRequiredSession } from "@/lib/auth/utils";
import { type InferSelectModel, and, eq } from "drizzle-orm";
import { conversationMessages, conversations } from "@/lib/database/schema";
import { action } from "@/lib/actions";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export type Conversation = InferSelectModel<typeof conversations>;

export const getConversations = async () => {
  const session = await getRequiredSession();
  const result = await db.query.conversations.findMany({
    where: eq(conversations.userId, session.user.userId),
  });

  return result;
};

export const createConversation = action(z.undefined(), async () => {
  const session = await getRequiredSession();
  const result = await db
    .insert(conversations)
    .values({
      title: "New Chat " + crypto.randomUUID(),
      userId: session.user.userId,
      model: "gpt-3.5-turbo",
    })
    .returning();

  revalidatePath("/chat", "layout");
  return result[0]!;
});

export const deleteConversation = action(
  z.object({
    conversationId: z.string(),
  }),
  async ({ conversationId }) => {
    const session = await getRequiredSession();

    await db
      .delete(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.userId, session.user.userId),
        ),
      );

    revalidatePath("/chat", "layout");
  },
);

export const sendConversationMessage = async ({
  conversationId,
  content,
}: {
  conversationId: string;
  content: string;
}) => {
  await getRequiredSession(); // ensure session

  await db.insert(conversationMessages).values({
    role: "user",
    conversationId,
    content,
  });
};
