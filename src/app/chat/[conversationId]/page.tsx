import Chat from "../Chat";

type Params = {
  conversationId: string;
};

export default function ChatConversationPage(...args: any[]) {
  console.log({ args });
  return (
    <div className="flex h-full w-full flex-col overflow-y-auto">
      <div className="mt-auto flex w-full flex-row justify-center">
        <Chat />
      </div>
    </div>
  );
}
