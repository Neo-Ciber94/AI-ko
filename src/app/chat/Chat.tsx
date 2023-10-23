"use client";

import { sendConversationMessage } from "@/components/layout/actions.server";
import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";
import { type ConversationMessage } from "./actions.server";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function Chat({
  messages,
}: {
  messages: ConversationMessage[];
}) {
  const { conversationId } = useParams<{ conversationId: string }>();

  const scrollToLastMessage = () => {
    const chatMessagesElement = document.querySelector("#chat-messages");

    if (chatMessagesElement) {
      chatMessagesElement.scrollTo({ top: chatMessagesElement.scrollHeight });
    }
  };

  const handleChat = async (message: string) => {
    await sendConversationMessage({
      conversationId,
      message,
    });

    scrollToLastMessage();
  };

  useEffect(() => scrollToLastMessage(), []);

  return (
    <div className="relative h-full w-full">
      {messages.length === 0 ? (
        <div
          className="flex h-full flex-grow flex-row items-center justify-center font-mono text-5xl 
          font-bold text-gray-400 dark:text-gray-300/50"
        >
          AIChatbot
        </div>
      ) : (
        <ChatMessages messages={messages} />
      )}

      <div className={`absolute bottom-4 left-1/2 w-[90%] -translate-x-1/2`}>
        <ChatInput onSend={handleChat} />
      </div>
    </div>
  );
}
