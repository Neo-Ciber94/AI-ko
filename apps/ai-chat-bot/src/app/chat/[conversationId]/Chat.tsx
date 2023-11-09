"use client";

import ChatInput from "./ChatInput";
import ChatMessageList from "./ChatMessages";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@/client/hooks/use-chat";
import { type ConversationMessageWithContents } from "@/lib/actions/conversationMessages";
import { useToast } from "@/client/hooks/use-toast";
import { generateConversationTitle } from "@/lib/actions/conversations";
import { eventEmitter, eventListener } from "@/client/events";
import { DEFAULT_CONVERSATION_TITLE } from "@/lib/common/constants";
import ModelSelector from "./ModelSelector";
import type { Conversation } from "@/lib/database/types";

type ChatProps = {
  conversation: Conversation;
  messages: ConversationMessageWithContents[];
};

export default function Chat(props: ChatProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const toast = useToast();
  const [conversation, setConversation] = useState(props.conversation);
  const { conversationId } = useParams<{ conversationId: string }>();
  const { chat, regenerate, messages, isLoading, isCallingFunction } = useChat({
    conversationId,
    messages: props.messages,
    model: conversation.model,
    onError(err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      console.error(err);
      toast.error(message);
    },
  });

  eventListener.regenerateChat.useSubscription(async () => {
    await regenerate();
  });

  const canRegenerate = useMemo(() => {
    const lastMessage = messages.at(-1);
    return !isLoading && lastMessage && lastMessage.role === "user";
  }, [isLoading, messages]);

  const scrollToBottom = () => {
    const container = containerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
    setLoaded(true);
  }, [messages]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const assistantMessages = messages.filter((x) => x.role === "assistant");

    const canGenerateTitle =
      assistantMessages.length >= 1 &&
      assistantMessages.length <= 3 &&
      conversation.title === DEFAULT_CONVERSATION_TITLE;

    if (!canGenerateTitle) {
      return;
    }

    const run = async () => {
      const result = await generateConversationTitle({
        conversationId,
      });

      if (result) {
        const newTitle = result.title;
        eventEmitter.conversationTitleChanged({
          conversationId,
          newTitle,
        });

        setConversation((prev) => ({ ...prev, title: newTitle }));
      }
    };

    void run();
  }, [conversation.title, conversationId, isLoading, messages, toast]);

  const handleChat = async (message: string) => {
    await chat(message);
  };

  return (
    <>
      <div
        ref={containerRef}
        className={`relative h-full w-full ${
          loaded ? "visible overflow-y-auto" : "invisible overflow-y-scroll"
        }`}
      >
        {messages.length === 0 ? (
          <div
            className="relative flex h-full flex-grow flex-col items-center justify-center font-mono 
          text-5xl font-bold text-gray-400 dark:text-gray-300/50"
          >
            <div className="absolute top-10 w-3/12">
              <ModelSelector
                conversation={conversation}
                onChange={(model) => {
                  setConversation((prev) => ({ ...prev, model }));
                }}
              />
            </div>
            <span>AIChatbot</span>
          </div>
        ) : (
          <ChatMessageList
            messages={messages}
            model={conversation.model}
            isLoading={isCallingFunction}
            canRegenerate={canRegenerate}
          />
        )}
      </div>

      <div className="absolute bottom-0 h-16 w-full bg-gradient-to-t from-white to-transparent dark:from-neutral-900"></div>

      <div className={`absolute bottom-4 left-1/2 w-[90%] -translate-x-1/2`}>
        <ChatInput onSend={handleChat} isLoading={isLoading} />
      </div>
    </>
  );
}
