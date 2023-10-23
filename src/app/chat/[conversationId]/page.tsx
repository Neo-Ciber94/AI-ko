import { notFound } from "next/navigation";
import Chat from "../Chat";
import { getConversationMessages } from "../actions.server";

type Params = {
  conversationId: string;
};

export default async function ChatConversationPage({
  params: { conversationId },
}: {
  params: Params;
}) {
  const messages = await getConversationMessages(conversationId);

  if (messages == null) {
    notFound();
  }

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto">
      <div className="mt-auto flex w-full flex-row justify-center">
        <Chat messages={messages} />
      </div>
    </div>
  );
}
