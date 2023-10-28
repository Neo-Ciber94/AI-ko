import { createShared } from "../use-shared";

type ConversationTitleUpdate = {
  conversationId: string;
  title: string;
};

export const useConversationTitleUpdate = createShared<
  ConversationTitleUpdate | undefined
>(undefined);
