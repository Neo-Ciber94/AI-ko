import { type ChatInput } from "@/app/api/ai/chat/route";
import { HEADER_SYSTEM_MESSAGE_ID } from "@/lib/common/constants";
import { useCallback, useRef, useState } from "react";

type ChatMessage = ChatInput["messages"][number];

type UseChatOptions = ChatInput & {
  endpoint?: string;
  conversationId: string;
};

export function useChat(opts: UseChatOptions) {
  const { endpoint = "/api/ai/chat", ...rest } = opts || {};
  const [messages, setMessages] = useState<ChatMessage[]>(rest.messages);
  const [isLoading, setIsLoading] = useState(false);
  const isReadingRef = useRef(false);

  const chat = useCallback(
    async (message: string) => {
      setIsLoading(true);

      try {
        const newMessage: ChatMessage = {
          id: `temp_${crypto.randomUUID()}`, // temporal id
          content: message,
          role: "user",
        };

        setMessages((msgs) => [...msgs, newMessage]);

        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: rest.model,
            messages: [...messages, newMessage],
          }),
        });

        const reader = res.body?.getReader();

        if (reader == null) {
          throw new Error("Unable to read response from server");
        }

        const decoder = new TextDecoder();

        const systemMessageId =
          res.headers.get(HEADER_SYSTEM_MESSAGE_ID) || crypto.randomUUID();

        const userMessageId =
          res.headers.get(HEADER_SYSTEM_MESSAGE_ID) || crypto.randomUUID();

        // Assign user message id, to last message
        setMessages((prev) => {
          const lastMessage = prev.at(-1);

          if (lastMessage && lastMessage.id.startsWith("temp_")) {
            const msgs = prev.slice();
            lastMessage.id = userMessageId;
            return msgs;
          }

          return prev;
        });

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          const text = decoder.decode(value);

          if (isReadingRef.current) {
            setMessages((prev) => {
              const msgs = prev.slice();
              const lastMessage = msgs.at(-1);

              if (!lastMessage) {
                return prev;
              }

              lastMessage.content += text;
              return msgs;
            });
          } else {
            isReadingRef.current = true;
            setMessages((prev) => [
              ...prev,
              { id: systemMessageId, role: "system", content: text },
            ]);
          }

          if (done) {
            break;
          }
        }
      } catch (err) {
        console.error(err);

        // TODO: Return to previous message?
      } finally {
        isReadingRef.current = false;
        setIsLoading(false);
      }
    },
    [endpoint, messages, rest.model],
  );

  return { chat, messages, isLoading };
}
