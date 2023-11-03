import type { InferSelectModel } from "drizzle-orm";
import type { conversations, conversationMessages } from "./schema";

export type ConversationMessage = InferSelectModel<typeof conversationMessages>;

export type Role = ConversationMessage["role"];

export type Conversation = InferSelectModel<typeof conversations>;

export type AIModel = Conversation["model"];
