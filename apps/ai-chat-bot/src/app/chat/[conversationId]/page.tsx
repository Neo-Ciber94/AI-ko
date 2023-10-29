import { redirect } from "next/navigation";
import Chat from "./Chat";
import { getConversationWithMessages } from "@/lib/actions/conversationMessages";

type Params = {
  conversationId: string;
};

export default async function ChatConversationPage({
  params: { conversationId },
}: {
  params: Params;
}) {
  const conversation = await getConversationWithMessages(conversationId);

  if (conversation == null) {
    redirect("/chat");
  }

  return (
    <div className="h-full w-full">
      <Chat
        conversation={conversation}
        messages={conversation.conversationMessages}
      />
    </div>
  );
}
