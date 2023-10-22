export interface Message {
  sender: "user" | "system";
  text: string;
}

type ChatMessagesProps = {
  messages: Message[];
};

export default function ChatMessages({ messages }: ChatMessagesProps) {
  return (
    <div className="flex flex-col gap-4 pt-4">
      {messages.map((message, idx) => {
        return (
          <div key={idx} className="flex flex-row items-center gap-4 px-8">
            {message.sender === "system" && (
              <div className="flex h-10 w-10 flex-shrink-0 flex-row items-center justify-center rounded-lg bg-red-500 text-white">
                AI
              </div>
            )}
            <div
              className={`w-full px-4 py-8 chat-bubble-${message.sender}`}
            >
              {message.text}
            </div>

            {message.sender === "user" && (
              <div className="flex h-10 w-10 flex-shrink-0 flex-row items-center justify-center rounded-lg bg-blue-500 text-white">
                ME
              </div>
            )}
          </div>
        );
      })}

      <div className="h-20 px-4"></div>
    </div>
  );
}
