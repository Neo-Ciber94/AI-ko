import { type ChatInput } from "@/app/api/ai/chat/route";
import {
  HEADER_ASSISTANT_MESSAGE_ID,
  HEADER_USER_MESSAGE_ID,
} from "@/lib/common/constants";
import { useCallback, useRef, useState } from "react";

type ChatMessage = ChatInput["messages"][number];

type ChatInputWithoutNewMessage = Omit<ChatInput, "newMessage">;

type UseChatOptions = ChatInputWithoutNewMessage & {
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
  const onErrorRef = useRef(onError);

  const chat = useCallback(
    async (message: string) => {
      setIsLoading(true);

      try {
        const prevMessages = messages;

        // Optimistically add the new message to the queue
        setMessages((msgs) => [
          ...msgs,
          {
            id: `temp_${crypto.randomUUID()}`, // temporal id
            //content: message,
            role: "user",
            contents: [{ type: "text", text: message }],
          },
        ]);

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
          } satisfies ChatInput),
        });

        if (!res) {
          const msg = await getResponseError(res);
          throw new Error(msg ?? "Something went wrong");
        }

        const reader = res.body?.getReader();

        if (reader == null) {
          throw new Error("Unable to read response from server");
        }

        const assistantMessageId =
          res.headers.get(HEADER_ASSISTANT_MESSAGE_ID) || crypto.randomUUID();

        const userMessageId =
          res.headers.get(HEADER_USER_MESSAGE_ID) || crypto.randomUUID();

        // Assign user message id, to last message
        setMessages((prev) => {
          const msgs = prev.slice();
          const lastMessage = msgs.pop(); // remove the message with the temp id and assign the actual id

          if (lastMessage) {
            msgs.push({ ...lastMessage, id: userMessageId });
          }

          return msgs;
        });

        let isReading = false;
        let content = "";
        const decoder = new TextDecoder();

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          const chunk = decoder.decode(value);

          content += chunk;

          if (isReading) {
            setMessages((prev) => {
              const msgs = prev.slice();
              const last = msgs.pop()!;
              msgs.push({
                ...last,
                contents: [{ type: "text", text: content }],
              });
              return msgs;
            });
          } else {
            setMessages((prev) => [
              ...prev,
              {
                id: assistantMessageId,
                role: "assistant",
                contents: [{ type: "text", text: content }],
              },
            ]);
            isReading = true;
          }

          if (done) {
            break;
          }
        }
      } catch (err) {
        if (onErrorRef.current) {
          onErrorRef.current(err);
        }
      } finally {
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
