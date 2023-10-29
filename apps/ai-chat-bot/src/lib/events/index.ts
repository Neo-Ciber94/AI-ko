import { declareEvents } from "react-declare-events";

export const { eventEmitter, eventListener } = declareEvents<{
  changeConversationTitle: {
    conversationId: string;
    newTitle: string;
  };
}>();
