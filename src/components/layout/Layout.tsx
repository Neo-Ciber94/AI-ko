import Header from "./Header";
import Sidebar from "./Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="h-screen flex flex-row">
      <Sidebar />
      <div className="flex flex-grow flex-col">
        <Header />
        {children}
      </div>
    </main>
  );
}
