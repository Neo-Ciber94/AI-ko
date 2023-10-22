export interface Message {
  sender: "user" | "system";
  text: string;
}

type ChatMessagesProps = {
  messages: Message[];
};

export default function ChatMessages({ messages }: ChatMessagesProps) {
  return (
    <div className="flex flex-col">
      {messages.map((message, idx) => {
        return (
          <div
            key={idx}
            className={`px-4 py-8 ${
              idx % 2 === 0 ? "bg-black/30" : "bg-transparent"
            }`}
          >
            {message.text}
          </div>
        );
      })}

      <div
        className={`h-32 px-4 ${
          messages.length % 2 === 0 ? "bg-black/30" : "bg-transparent"
        }`}
      ></div>
    </div>
  );
}
