import Layout from "@/components/layout/Layout";

export default function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Layout showSidebar>{children}</Layout>;
}
