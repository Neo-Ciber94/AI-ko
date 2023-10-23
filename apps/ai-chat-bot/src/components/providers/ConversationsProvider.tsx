"use client";

import { type conversations } from "@/lib/database/schema";
import { type InferSelectModel } from "drizzle-orm";
import { createContext, useContext } from "react";

type Conversation = InferSelectModel<typeof conversations>;

const ConversationsContext = createContext<Conversation[]>([]);

export function ConversationsProvider({
  children,
  conversations,
}: {
  conversations: Conversation[];
  children: React.ReactNode;
}) {
  return (
    <ConversationsContext.Provider value={conversations}>
      {children}
    </ConversationsContext.Provider>
  );
}

export function useConversations() {
  return useContext(ConversationsContext);
}
