import { redirect } from "next/navigation";
import Chat from "../Chat";
import { getConversationMessages } from "@/lib/actions/conversation-messages";

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
    redirect("/chat");
  }

  return (
    <div className="h-full w-full">
      <Chat messages={messages} />
    </div>
  );
}
