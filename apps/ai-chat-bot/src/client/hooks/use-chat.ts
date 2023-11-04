import { type ChatInput } from "@/app/api/ai/chat/route";
import { type ChatEventMessage } from "@/lib/ai/chatCompletion";
import {
  HEADER_ASSISTANT_MESSAGE_ID,
  HEADER_USER_MESSAGE_ID,
} from "@/lib/common/constants";
import { useCallback, useRef, useState } from "react";
import { EventSourceParserStream } from "eventsource-parser/stream";

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
  const [isCallingFunction, setIsCallingFunction] = useState(false);
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
            role: "user",
            contents: [{ type: "text", text: message }],
          },
        ]);

        const response = await fetch(endpoint, {
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

        if (!response) {
          const msg = await getResponseError(response);
          throw new Error(msg ?? "Something went wrong");
        }

        const body = response.body;

        if (body == null) {
          throw new Error("Unable to read response from server");
        }

        const assistantMessageId =
          response.headers.get(HEADER_ASSISTANT_MESSAGE_ID) ||
          crypto.randomUUID();

        const userMessageId =
          response.headers.get(HEADER_USER_MESSAGE_ID) || crypto.randomUUID();

        // Assign user message id, to last message
        setMessages((prev) => {
          const msgs = prev.slice();
          const lastMessage = msgs.pop(); // remove the message with the temp id and assign the actual id

          if (lastMessage) {
            msgs.push({ ...lastMessage, id: userMessageId });
          }

          return msgs;
        });

        const stream = body
          .pipeThrough(new TextDecoderStream())
          .pipeThrough(new EventSourceParserStream());

        const reader = stream.getReader();
        let isReading = false;
        let textContent = "";

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value: event } = await reader.read();

          if (event && event.type === "event") {
            const json = event?.data || "";
            const eventMsg = JSON.parse(json) as ChatEventMessage;

            switch (eventMsg.type) {
              case "text": {
                textContent += eventMsg.chunk;

                if (isReading) {
                  setMessages((prev) => {
                    const msgs = prev.slice();
                    const last = msgs.pop()!;
                    msgs.push({
                      ...last,
                      contents: [{ type: "text", text: textContent }],
                    });
                    return msgs;
                  });
                } else {
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: assistantMessageId,
                      role: "assistant",
                      contents: [{ type: "text", text: textContent }],
                    },
                  ]);
                  isReading = true;
                }

                break;
              }
              case "image": {
                if (isReading) {
                  setMessages((prev) => {
                    const msgs = clone(prev);
                    const last = msgs.pop();

                    last?.contents.push({
                      type: "image",
                      imagePrompt: eventMsg.imagePrompt,
                      imageUrl: eventMsg.imageUrl,
                    });

                    return msgs;
                  });
                } else {
                  setMessages((prev) => [
                    ...prev,
                    {
                      id: assistantMessageId,
                      role: "assistant",
                      contents: [
                        {
                          type: "image",
                          imagePrompt: eventMsg.imagePrompt,
                          imageUrl: eventMsg.imageUrl,
                        },
                      ],
                    },
                  ]);

                  isReading = true;
                }

                break;
              }
              case "is_calling_function": {
                setIsCallingFunction(true);
                break;
              }
              case "error": {
                throw new Error(eventMsg.message);
              }
            }
          }

          if (event == null || done) {
            break;
          }
        }
      } catch (err) {
        if (onErrorRef.current) {
          onErrorRef.current(err);
        }
      } finally {
        setIsLoading(false);
        setIsCallingFunction(false);
      }
    },
    [conversationId, endpoint, messages, model],
  );

  return { chat, messages, isLoading, isCallingFunction };
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

function clone<T>(obj: T) {
  if (typeof structuredClone !== "undefined") {
    return structuredClone(obj) as T;
  }

  return JSON.parse(JSON.stringify(obj));
}
