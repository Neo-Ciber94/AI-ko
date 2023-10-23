"use client";

import { isomorphicClient } from "@/lib/utils/isomorphic.client";
import ChatInput from "./ChatInput";
import ChatMessages from "./ChatMessages";
import { type ConversationMessage } from "./actions.server";

export default function Chat({
  messages,
}: {
  messages: ConversationMessage[];
}) {
  const [isOpen] = isomorphicClient.useValue("isSidebarOpen");

  return (
    <div className="relative w-full">
      <ChatMessages messages={messages} />

      <div
        className={`fixed bottom-4 left-[calc(50%-16px)] w-[90%] -translate-x-1/2 transition-all duration-300 ${
          isOpen ? "ml-0 sm:ml-[150px]" : "ml-0"
        }`}
      >
        <ChatInput onSend={console.log} />
      </div>
    </div>
  );
}
