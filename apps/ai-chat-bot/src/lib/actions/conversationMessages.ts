"use server";

import { getRequiredSession } from "@/lib/auth/utils";
import { db } from "@/lib/database";
import {
  conversationMessages,
  conversations,
  messageContents,
} from "@/lib/database/schema";
import { type InferSelectModel, and, eq, asc } from "drizzle-orm";
import { type AIModel } from "./conversations";

export type ConversationMessage = InferSelectModel<typeof conversationMessages>;

export type Role = ConversationMessage["role"];

// FIXME: This is weird
export type ConversationMessageWithContents = Pick<
  NonNull<Awaited<ReturnType<typeof getConversationWithMessages>>>,
  "conversationMessages"
>["conversationMessages"][number];

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

  // const conversation = await sql`select * from ${conversations}
  //   where ${conversations.id} = ${conversationId} and ${conversations.userId} = ${session.user.userId}
  //   join ${conversationMessages} on ${conversationMessages.conversationId} = ${conversations.id}`;

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
      messageContents,
      eq(messageContents.conversationMessageId, conversationMessages.id),
    )
    .orderBy(
      asc(conversationMessages.createdAt),
      asc(conversationMessages.createdAt),
    )
    .all();

  if (rows == null) {
    return null;
  }

  type ConversationResult = {
    id: string;
    model: AIModel;
    title: string;
    conversationMessages: {
      id: string;
      role: Role;
      contents: {
        type: "text" | "image";
        data: string;
      }[];
    }[];
  };

  const conversation = rows.reduce<ConversationResult>(
    (acc, row) => {
      if (row.conversation_message) {
        acc.conversationMessages.push({
          ...row.conversation_message,
          contents: [],
        });
      }

      if (row.message_content) {
        const conversationMessages = acc.conversationMessages.find(
          (x) => x.id === row.message_content?.conversationMessageId,
        );

        if (conversationMessages) {
          conversationMessages.contents.push(row.message_content);
        }
      }

      return acc;
    },
    {
      id: rows[0].conversation.id,
      model: rows[0].conversation.model,
      title: rows[0].conversation.title,
      conversationMessages: [],
    } as ConversationResult,
  );

  return conversation;
}
