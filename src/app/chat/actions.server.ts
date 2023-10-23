import { action } from "@/lib/action";
import { getRequiredSession } from "@/lib/auth/utils";
import { db } from "@/lib/database";
import { conversationMessages, users } from "@/lib/database/schema";
import { and, asc, eq } from "drizzle-orm";
import z from "zod";

export const getConversationMessages = action(
  z.object({ conversationId: z.string() }),
  async ({ conversationId }) => {
    const session = await getRequiredSession();
    const messages = await db.query.conversationMessages.findMany({
      where: and(
        eq(users.id, session.user.userId),
        eq(conversationMessages.conversationId, conversationId),
      ),
      orderBy: [asc(conversationMessages.createdAt)],
    });

    return messages;
  },
);
