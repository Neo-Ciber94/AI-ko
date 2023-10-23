"use server";

import { getRequiredSession } from "@/lib/auth/utils";
import { db } from "@/lib/database";
import {
  conversationMessages,
  conversations,
  users,
} from "@/lib/database/schema";
import { InferSelectModel, and, asc, eq } from "drizzle-orm";

export type ConversationMessage = InferSelectModel<typeof conversationMessages>;

export async function getConversationMessages(conversationId: string) {
  const session = await getRequiredSession();
  const conversation = await db.query.conversations.findFirst({
    where: eq(conversations.id, conversationId),
  });

  if (conversation == null) {
    return null;
  }

  const messages = await db.query.conversationMessages.findMany({
    where: and(
      eq(users.id, session.user.userId),
      eq(conversationMessages.conversationId, conversationId),
    ),
    orderBy: [asc(conversationMessages.createdAt)],
  });

  return messages;
}
