"use client";

import { sendConversationMessage } from "@/components/layout/actions.server";
import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";
import { type ConversationMessage } from "./actions.server";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Chat(props: { messages: ConversationMessage[] }) {
  const [messages, setMessages] = useState(props.messages);
  const router = useRouter();
  const { conversationId } = useParams<{ conversationId: string }>();
  const [loaded, setLoaded] = useState(false);

  const scrollToLastMessage = () => {
    const chatMessagesElement = document.querySelector("#chat-messages");

    if (chatMessagesElement) {
      chatMessagesElement.scrollTo({ top: chatMessagesElement.scrollHeight });

      setTimeout(() => {
        setLoaded(true);
      }, 100);
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
    <div className="relative w-full">
      <div className={`${loaded ? "opacity-100" : "opacity-0"}`}>
        <ChatMessages messages={messages} />
      </div>

      <div className={`absolute bottom-4 left-1/2 w-[90%] -translate-x-1/2`}>
        <ChatInput onSend={handleChat} />
      </div>
    </div>
  );
}
