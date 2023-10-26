import Layout from "@/components/layout/Layout";
import { ConversationsProvider } from "@/components/providers/ConversationsProvider";
import { getConversations } from "@/lib/actions/conversations";

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
