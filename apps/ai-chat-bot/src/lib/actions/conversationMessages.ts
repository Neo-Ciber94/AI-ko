"use server";

import { getRequiredSession } from "@/lib/auth/utils";
import { db } from "@/lib/database";
import {
  conversationMessages,
  conversations,
  messageImageContents,
  messageTextContents,
} from "@/lib/database/schema";
import { and, eq, asc, desc } from "drizzle-orm";
import type { AIModel, Role } from "../database/types";

type MessageImage = {
  //id: string;
  type: "image";
  imagePrompt: string;
  imageUrl: string;
};

type MessageText = {
  //id: string;
  type: "text";
  text: string;
};

type MessageContents = MessageImage | MessageText;

type ConversationData = {
  id: string;
  model: AIModel;
  title: string;
  createdAt: number;
  userId: string;
  conversationMessages: {
    id: string;
    role: Role;
    contents: MessageContents[];
  }[];
};

export type ConversationMessageWithContents =
  ConversationData["conversationMessages"][number];

export async function getConversationWithMessages(conversationId: string) {
  const session = await getRequiredSession();
  // const conversation = await db.query.conversations.findFirst({
  //   where: and(
  //     eq(conversations.id, conversationId),
  //     eq(conversations.userId, session.user.userId),
  //   ),
  //   with: {
  //     conversationMessages: {
  //       orderBy: [asc(conversationMessages.createdAt)],
  //       with: {
  //         contents: {
  //           columns: {
  //             type: true,
  //             data: true,
  //           },
  //           orderBy: [asc(conversationMessages.createdAt)],
  //         },
  //       },
  //     },
  //   },
  // });

  const rows = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.id, conversationId),
        eq(conversations.userId, session.user.userId),
      ),
    )
    .leftJoin(
      conversationMessages,
      eq(conversationMessages.conversationId, conversations.id),
    )
    .leftJoin(
      messageImageContents,
      eq(messageImageContents.conversationMessageId, conversationMessages.id),
    )
    .leftJoin(
      messageTextContents,
      eq(messageTextContents.conversationMessageId, conversationMessages.id),
    )
    .orderBy(
      asc(conversationMessages.createdAt),
      desc(messageImageContents.createdAt),
      desc(messageTextContents.createdAt),
    )
    .all();

  if (rows == null || rows.length == 0) {
    return null;
  }

  let conversation: ConversationData = {
    id: rows[0].conversation.id,
    model: rows[0].conversation.model,
    title: rows[0].conversation.title,
    createdAt: rows[0].conversation.createdAt,
    userId: rows[0].conversation.userId,
    conversationMessages: [],
  };

  conversation = rows.reduce((acc, row) => {
    if (row.conversation_message) {
      acc.conversationMessages.push({
        ...row.conversation_message,
        contents: [],
      });
    }

    if (row.message_text_content) {
      const m = acc.conversationMessages.find(
        (x) => x.id === row.message_text_content?.conversationMessageId,
      );
      if (m) {
        m.contents.push({
          type: "text",
          ...row.message_text_content,
        });
      }
    }

    if (row.message_image_content) {
      const m = acc.conversationMessages.find(
        (x) => x.id === row.message_image_content?.conversationMessageId,
      );
      if (m) {
        m.contents.push({
          type: "image",
          ...row.message_image_content,
        });
      }
    }

    return acc;
  }, conversation);

  return conversation;
}

export async function getConversationTitle(conversationId: string) {
  const result = await db.query.conversations.findFirst({
    where: eq(conversations.id, conversationId),
    columns: {
      id: true,
      title: true,
    },
  });

  return result;
}
