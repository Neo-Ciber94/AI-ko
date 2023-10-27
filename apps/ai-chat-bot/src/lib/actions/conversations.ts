"use server";

import { db } from "@/lib/database";
import { getRequiredSession } from "@/lib/auth/utils";
import { type InferSelectModel, and, eq } from "drizzle-orm";
import { conversationMessages, conversations } from "@/lib/database/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type Conversation = InferSelectModel<typeof conversations>;

export const getConversations = async () => {
  const session = await getRequiredSession();
  const result = await db.query.conversations.findMany({
    where: eq(conversations.userId, session.user.userId),
  });

  return result;
};

export async function createConversation() {
  const session = await getRequiredSession();
  const result = await db
    .insert(conversations)
    .values({
      title: "New Chat " + crypto.randomUUID(),
      userId: session.user.userId,
      model: "gpt-3.5-turbo",
    })
    .returning();

  const conversation = result[0]!;
  revalidatePath("/chat", "layout");
  redirect(`/chat/${conversation.id}`);
}

export async function updateConversation({
  conversationId,
  title,
}: {
  conversationId: string;
  title: string;
}) {
  const session = await getRequiredSession();

  await db
    .update(conversations)
    .set({ title })
    .where(
      and(
        eq(conversations.id, conversationId),
        eq(conversations.userId, session.user.userId),
      ),
    );

  revalidatePath("/chat", "layout");
}

export async function deleteConversation({
  conversationId,
}: {
  conversationId: string;
}) {
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
}

// TODO: Delete
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
