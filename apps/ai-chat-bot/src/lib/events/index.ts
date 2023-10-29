import { declareEvents } from "react-declare-events";

export const { eventEmitter, eventListener } = declareEvents<{
  conversationTitleChanged: {
    conversationId: string;
    newTitle: string;
  };
}>();
