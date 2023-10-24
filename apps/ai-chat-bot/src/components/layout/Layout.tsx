import Header from "./Header";
import Sidebar from "./Sidebar";

type LayoutProps = {
  showSidebar?: boolean;
  children: React.ReactNode;
};

export default function Layout({ children, showSidebar }: LayoutProps) {
  return (
    <main className="flex h-screen flex-row overflow-hidden">
      {showSidebar && <Sidebar />}
      <div className="flex flex-grow flex-col relative">
        <Header showSidebarControls={showSidebar} />
        {children}
      </div>
    </main>
  );
}