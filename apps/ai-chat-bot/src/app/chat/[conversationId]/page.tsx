import { redirect } from "next/navigation";
import Chat from "./Chat";
import {
  getConversationTitle,
  getConversationWithMessages,
} from "@/lib/actions/conversationMessages";
import fs from "fs/promises";
import path from "path";
import { HighLightJsStylesProvider } from "@/components/providers/HighLightJsStylesProvider";
import type { Metadata, ResolvingMetadata } from "next";

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

  const highLightJsStyles = await loadHighLightJsThemeStyles();

  return (
    <HighLightJsStylesProvider styles={highLightJsStyles}>
      <div className="h-full w-full">
        <Chat
          conversation={conversation}
          messages={conversation.conversationMessages}
        />
      </div>
    </HighLightJsStylesProvider>
  );
}

async function loadHighLightJsThemeStyles() {
  const publicDir = path.join(process.cwd(), "public");
  const darkThemeStylesPromise = fs.readFile(
    path.join(publicDir, "styles", "highlight.js", "github-dark.min.css"),
    "utf-8",
  );

  const lightThemeStylesPromise = fs.readFile(
    path.join(publicDir, "styles", "highlight.js", "github.min.css"),
    "utf-8",
  );

  const [darkThemeStyles, lightThemeStyles] = await Promise.all([
    darkThemeStylesPromise,
    lightThemeStylesPromise,
  ]);

  return {
    darkThemeStyles,
    lightThemeStyles,
  };
}
