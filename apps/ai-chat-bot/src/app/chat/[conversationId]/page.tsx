import { redirect } from "next/navigation";
import Chat from "./Chat";
import {
  getConversationTitle,
  getConversationWithMessages,
} from "@/lib/actions/conversationMessages";
import type { Metadata, ResolvingMetadata } from "next";
import ServerHighLightJsStylesProvider from "@/components/providers/ServerHighLightJsStylesProvider";

type Params = {
  conversationId: string;
};

export async function generateMetadata(
  {
    params: { conversationId },
  }: {
    params: Params;
  },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const conversation = await getConversationTitle(conversationId);

  if (conversation == null) {
    const parentMetadata = await parent;
    return { title: parentMetadata.title };
  }

  return {
    title: conversation.title,
  };
}

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
    <ServerHighLightJsStylesProvider>
      <div className="h-full w-full">
        <Chat
          conversation={conversation}
          messages={conversation.conversationMessages}
        />
      </div>
    </ServerHighLightJsStylesProvider>
  );
}
