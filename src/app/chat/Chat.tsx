"use client";

import { sendConversationMessage } from "@/components/layout/actions.server";
import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";
import { type ConversationMessage } from "./actions.server";
import { useParams, useRouter } from "next/navigation";

export default function Chat({
  messages,
}: {
  messages: ConversationMessage[];
}) {
  const router = useRouter();
  const { conversationId } = useParams<{ conversationId: string }>();
  const handleChat = async (message: string) => {
    await sendConversationMessage({
      conversationId,
      message,
    });

    router.refresh();
    const chatMessagesElement = document.querySelector("#chat-messages");

    if (chatMessagesElement) {
      chatMessagesElement.scrollTo({ top: chatMessagesElement.scrollHeight });
    }
  };

  return (
    <div className="relative w-full">
      <ChatMessages messages={messages} />

      <div className={`absolute bottom-4 left-1/2 w-[90%] -translate-x-1/2`}>
        <ChatInput onSend={handleChat} />
      </div>
    </div>
  );
}
