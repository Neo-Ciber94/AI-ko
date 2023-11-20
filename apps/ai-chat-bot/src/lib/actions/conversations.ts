"use server";

import { db } from "@/lib/database";
import { getRequiredSession } from "@/lib/auth/utils";
import { and, desc, eq } from "drizzle-orm";
import {
  conversationMessages,
  conversations,
  messageTextContents,
} from "@/lib/database/schema";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { openaiInstance } from "../ai";
import {
  COOKIE_CONVERSATION_CREATED,
  DEFAULT_CONVERSATION_TITLE,
} from "../common/constants";
import { type Result } from "../types";
import { type AIModel } from "../database/types";
import { cookies } from "next/headers";
import { action } from "./action";
import { z } from "zod";

export async function getConversations() {
  const session = await getRequiredSession();
  const result = await db.query.conversations.findMany({
    where: eq(conversations.userId, session.user.userId),
    orderBy: desc(conversations.createdAt),
  });

  return result;
}

export const createConversation = action(undefined, async () => {
  const session = await getRequiredSession();
  const result = await db
    .insert(conversations)
    .values({
      title: DEFAULT_CONVERSATION_TITLE,
      userId: session.user.userId,
      model: "gpt-3.5-turbo",
    })
    .returning();

  const conversation = result[0]!;
  cookies().set(COOKIE_CONVERSATION_CREATED, "1", { maxAge: 1 });
  revalidatePath("/chat", "layout");
  redirect(`/chat/${conversation.id}`);
});

export const updateConversationTitle = action(
  z.object({ conversationId: z.string(), title: z.string().trim().min(1) }),
  async ({ input: { title, conversationId } }) => {
    const session = await getRequiredSession();

    await db
      .update(conversations)
      .set({ title: title.trim() })
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.userId, session.user.userId),
        ),
      );

    revalidatePath("/chat", "layout");
  },
);

export const deleteConversation = action(
  z.object({ conversationId: z.string() }),
  async ({ input: { conversationId } }) => {
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

export const generateConversationTitle = action(
  z.object({ conversationId: z.string() }),
  async ({ input: { conversationId } }) => {
    const session = await getRequiredSession();
    const messages = await db
      .select({
        role: conversationMessages.role,
        content: messageTextContents.text,
        conversationTitle: conversations.title,
      })
      .from(conversations)
      .limit(5) // we just take enough messages
      .where(
        and(
          eq(conversations.id, conversationId),
          eq(conversations.userId, session.user.userId),
        ),
      )
      .leftJoin(
        conversationMessages,
        eq(conversationMessages.conversationId, conversationId),
      )
      .leftJoin(
        messageTextContents,
        eq(messageTextContents.conversationMessageId, conversationMessages.id),
      )
      .orderBy(
        desc(conversationMessages.createdAt),
        desc(messageTextContents.createdAt),
      );

    if (messages.length === 0) {
      notFound();
    }

    const lastUserMessage = messages.filter((x) => x.role === "user").pop();
    const lastAssistantMessage = messages
      .filter((x) => x.role === "assistant")
      .pop();

    if (lastUserMessage == null && lastAssistantMessage == null) {
      return null;
    }

    const conversationTitle =
      messages[0].conversationTitle || DEFAULT_CONVERSATION_TITLE;
    const content =
      lastAssistantMessage?.content || lastUserMessage?.content || "";
    const openAiResponse = await openaiInstance.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Generate a short title that summarize the contents of this conversation: \n\n${content}`,
        },
      ],
    });

    const generatedTitle = openAiResponse.choices[0]?.message.content;
    const newTitle = generatedTitle
      ? removeQuotesFromString(generatedTitle)
      : conversationTitle;

    await db
      .update(conversations)
      .set({ title: newTitle.trim() })
      .where(eq(conversations.id, conversationId));

    return { title: newTitle };
  },
);

export const updateConversationModel = action(
  z.object({
    conversationId: z.string(),
    model: z.enum(["gpt-3.5-turbo", "gpt-4"]),
  }),
  async ({ input: { conversationId, model } }) => {
    const session = await getRequiredSession();
    const conversationModel: AIModel =
      model === "gpt-4" ? "gpt-4" : "gpt-3.5-turbo";

    const conversation = await db.query.conversations.findFirst({
      where: and(
        eq(conversations.id, conversationId),
        eq(conversations.userId, session.user.userId),
      ),
      with: {
        conversationMessages: true,
      },
    });

    if (conversation == null) {
      return {
        type: "error",
        error: "Conversation not found",
      };
    }

    if (conversation.conversationMessages.length > 1) {
      return {
        type: "error",
        error: "Cannot change the AI model in a conversation with messages",
      };
    }

    await db
      .update(conversations)
      .set({
        model: conversationModel,
      })
      .where(eq(conversations.id, conversationId));

    return { type: "success" };
  },
);

function removeQuotesFromString(input: string) {
  return input.replace(/^['"]|['"]$/g, "");
}
