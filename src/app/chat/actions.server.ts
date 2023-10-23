"use server";

import { getRequiredSession } from "@/lib/auth/utils";
import { db } from "@/lib/database";
import { conversationMessages, conversations } from "@/lib/database/schema";
import { InferSelectModel, and, asc, eq } from "drizzle-orm";

export type ConversationMessage = InferSelectModel<typeof conversationMessages>;

export async function getConversationMessages(conversationId: string) {
  const session = await getRequiredSession();
  const conversation = await db.query.conversations.findFirst({
    where: and(
      eq(conversations.id, conversationId),
      eq(conversations.userId, session.user.userId),
    ),
  });

  if (conversation == null) {
    return null;
  }

  const messages = await db.query.conversationMessages.findMany({
    where: eq(conversationMessages.conversationId, conversation.id),
    orderBy: [asc(conversationMessages.createdAt)],
  });

  return messages;
}
