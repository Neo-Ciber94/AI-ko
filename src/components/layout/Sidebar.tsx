"use client";

import { useSidebar } from "../providers/SidebarContext";

export default function Sidebar() {
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();

  const handleToggle = () => {
    setIsSidebarOpen((x) => !x);
  };

  return (
    <>
      <aside
        suppressHydrationWarning
        className={`bg-violet-800 rounded-tr-xl rounded-br-xl
            text-white transition-all overflow-hidden duration-300 ${
              isSidebarOpen ? "w-[300px]" : "w-0"
            }`}
      >
        <div className="p-4">Sidebar</div>
      </aside>
      <button
        suppressHydrationWarning
        className="px-4 mb-auto"
        onClick={handleToggle}
      >
        {isSidebarOpen ? "Close" : "Open"}
      </button>
    </>
  );
}
