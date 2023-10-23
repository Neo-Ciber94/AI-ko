import Layout from "@/components/layout/Layout";
import { getConversations } from "@/components/layout/actions.server";
import { ConversationsProvider } from "@/components/providers/ConversationsProvider";

export default async function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const conversations = await getConversations();

  return (
    <ConversationsProvider conversations={conversations}>
      <Layout showSidebar>{children}</Layout>
    </ConversationsProvider>
  );
}
