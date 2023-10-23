"use server";

import { db } from "@/lib/database";
import { getRequiredSession } from "@/lib/auth/utils";
import { InferSelectModel, eq } from "drizzle-orm";
import { conversations, users } from "@/lib/database/schema";
import { action } from "@/lib/action";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export type Conversation = InferSelectModel<typeof conversations>;

export const getConversations = action(z.undefined(), async () => {
  const session = await getRequiredSession();
  const result = await db.query.conversations.findMany({
    where: eq(conversations.userId, session.user.userId),
  });
  return result;
});

export const createConversation = action(z.undefined(), async () => {
  const session = await getRequiredSession();
  const result = await db
    .insert(conversations)
    .values({
      title: "New Chat",
      userId: session.user.userId,
    })
    .returning();

  revalidatePath("/chat");
  return result[0]!;
});
