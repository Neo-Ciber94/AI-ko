"use server";

import { db } from "@/lib/database";
import { getRequiredSession } from "@/lib/auth/utils";
import { type InferSelectModel, and, eq } from "drizzle-orm";
import { conversations } from "@/lib/database/schema";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { openaiInstance } from "../ai";
import { DEFAULT_CONVERSATION_TITLE } from "../common/constants";
import { type Result } from "../types";

export type Conversation = InferSelectModel<typeof conversations>;

export type AIModel = Conversation["model"];

export async function getConversations() {
  const session = await getRequiredSession();
  const result = await db.query.conversations.findMany({
    where: eq(conversations.userId, session.user.userId),
  });

  return result;
}

export async function createConversation() {
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
  revalidatePath("/chat", "layout");
  redirect(`/chat/${conversation.id}`);
}

export async function updateConversationTitle({
  conversationId,
  title,
}: {
  conversationId: string;
  title: string;
}) {
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

export async function generateConversationTitle({
  conversationId,
}: {
  conversationId: string;
}): Promise<Result<{ conversationTitle: string }, string>> {
  const session = await getRequiredSession();
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
    notFound();
  }

  const lastAssistantMessage = conversation.conversationMessages
    .filter((x) => x.role === "assistant")
    .pop();

  if (lastAssistantMessage == null) {
    return {
      type: "error",
      error: "Failed to generate message",
    };
  }

  const openAiResponse = await openaiInstance.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `Generate a short and concise single line title that summarizes a conversation with this content: \n\n${lastAssistantMessage.content}`,
      },
    ],
  });

  const generatedTitle = openAiResponse.choices[0]?.message.content;
  const newTitle = generatedTitle
    ? removeQuotesFromString(generatedTitle)
    : conversation.title;

  await db
    .update(conversations)
    .set({ title: newTitle.trim() })
    .where(eq(conversations.id, conversation.id));

  return { type: "success", value: { conversationTitle: newTitle } };
}

export async function updateConversationModel({
  conversationId,
  model,
}: {
  conversationId: string;
  model: AIModel;
}): Promise<Result<void, string>> {
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
}

function removeQuotesFromString(input: string) {
  return input.replace(/^['"]|['"]$/g, "");
}
