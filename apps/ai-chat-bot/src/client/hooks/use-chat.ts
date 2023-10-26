import { type ChatInput } from "@/app/api/ai/chat/route";
import { HEADER_SYSTEM_MESSAGE_ID } from "@/lib/common/constants";
import { useCallback, useRef, useState } from "react";

type ChatMessage = ChatInput["messages"][number];

type ChatInputWithoutLastMessage = Omit<ChatInput, "newMessage">;

type UseChatOptions = ChatInputWithoutLastMessage & {
  endpoint?: string;
  conversationId: string;
  onError?: (err: unknown) => void;
};

export function useChat(opts: UseChatOptions) {
  const {
    endpoint = "/api/ai/chat",
    onError,
    model,
    conversationId,
    messages: initialMessages,
  } = opts || {};
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const isReadingRef = useRef(false);
  const onErrorRef = useRef(onError);

  const chat = useCallback(
    async (message: string) => {
      setIsLoading(true);

      try {
        const newMessage: ChatMessage = {
          id: `temp_${crypto.randomUUID()}`, // temporal id
          content: message,
          role: "user",
        };

        const prevMessages = messages;

        // Optimistically add the new message to the queue
        setMessages((msgs) => [...msgs, newMessage]);

        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            conversationId,
            messages: prevMessages,
            newMessage: { content: message },
          }),
        });

        if (!res) {
          const msg = await getResponseError(res);
          throw new Error(msg ?? "Something went wrong");
        }

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
        if (onErrorRef.current) {
          onErrorRef.current(err);
        }

        // TODO: Rollback to previous message?
      } finally {
        isReadingRef.current = false;
        setIsLoading(false);
      }
    },
    [conversationId, endpoint, messages, model],
  );

  return { chat, messages, isLoading };
}

async function getResponseError(res: Response) {
  if (res.headers.get("Content-Type") === "application/json") {
    const json = await res.json();

    if (typeof json.message === "string") {
      return json.message;
    }

    return null;
  }

  if (res.headers.get("Content-Type") === "text/plain") {
    return res.text();
  }

  return null;
}
