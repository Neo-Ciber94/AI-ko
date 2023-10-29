"use server";

import { getRequiredSession } from "@/lib/auth/utils";
import { db } from "@/lib/database";
import { conversationMessages, conversations } from "@/lib/database/schema";
import { type InferSelectModel, and, eq, asc } from "drizzle-orm";

export type ConversationMessage = InferSelectModel<typeof conversationMessages>;

export async function getConversationWithMessages(conversationId: string) {
  const session = await getRequiredSession();
  const conversation = await db.query.conversations.findFirst({
    where: and(
      eq(conversations.id, conversationId),
      eq(conversations.userId, session.user.userId),
    ),
    with: {
      conversationMessages: {
        orderBy: [asc(conversationMessages.createdAt)],
      },
    },
  });

  if (conversation == null) {
    return null;
  }

  return conversation;
}
