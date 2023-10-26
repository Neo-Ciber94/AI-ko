import Header from "@/components/Header";

export default function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex h-screen flex-row overflow-hidden">
      <div className="relative flex flex-grow flex-col">
        <Header />
        {children}
      </div>
    </main>
  );
}
