import { type ConversationMessage } from "./actions.server";

type ChatMessagesProps = {
  messages: Omit<ConversationMessage, "conversationId" | "createdAt">[];
};

export default function ChatMessages({ messages }: ChatMessagesProps) {
  return (
    <div className="flex flex-col gap-4 pt-4">
      {messages.map((message) => {
        return (
          <div
            key={message.id}
            className="flex flex-row items-center gap-4 px-8"
          >
            {message.role === "system" && (
              <div
                className="flex h-10 w-10 flex-shrink-0 flex-row items-center justify-center rounded-lg border-2 border-red-500
              bg-black text-white"
              >
                AI
              </div>
            )}
            <div
              className={`w-full px-4 py-8 ${
                message.role === "user"
                  ? "chat-bubble-user"
                  : "chat-bubble-system"
              }`}
            >
              {message.content}
            </div>

            {message.role === "user" && (
              <div
                className="flex h-10 w-10 flex-shrink-0 flex-row items-center justify-center rounded-lg 
                border-2 border-blue-500 bg-black text-white"
              >
                Me
              </div>
            )}
          </div>
        );
      })}

      <div className="h-40 px-4"></div>
    </div>
  );
}
