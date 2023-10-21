import Sidebar from "./Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="h-screen flex flex-row">
      <Sidebar />
      {children}
    </main>
  );
}
