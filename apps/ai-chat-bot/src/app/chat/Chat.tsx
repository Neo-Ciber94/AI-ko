"use client";

import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";
import { type ConversationMessage } from "./actions.server";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useChat } from "@/client/hooks/use-chat";

export default function Chat(props: { messages: ConversationMessage[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { conversationId } = useParams<{ conversationId: string }>();
  const { chat, isLoading, messages } = useChat({
    messages: props.messages,
    model: "gpt-3.5-turbo",
    conversationId,
  });

  const scrollToBottom = () => {
    const container = containerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight });
    }
  };

  useEffect(() => scrollToBottom(), []);

  const handleChat = async (message: string) => {
    await chat(message);
  };

  return (
    <>
      <div
        id="chat-messages"
        ref={containerRef}
        className="relative h-full w-full overflow-y-auto"
      >
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
      </div>

      <div className={`absolute bottom-4 left-1/2 w-[90%] -translate-x-1/2`}>
        <ChatInput onSend={handleChat} disabled={isLoading} />
      </div>
    </>
  );
}
