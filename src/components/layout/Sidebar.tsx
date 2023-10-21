"use client";

import { isomorphicClient } from "@/lib/utils/isomorphic.client";
import { useSidebar } from "../providers/SidebarContext";

export default function Sidebar() {
  const [ isSidebarOpen, setIsSidebarOpen ] = isomorphicClient.useIsomorphicStore('sidebarOpen');

  const handleToggle = () => {
    setIsSidebarOpen((x) => !x);
  };

  return (
    <>
      <aside
        suppressHydrationWarning
        className={`bg-violet-800 text-white transition-all overflow-hidden duration-300 h-full shadow-xl sm:static fixed left-0 ${
          isSidebarOpen ? "w-[300px]" : "w-0"
        }`}
      >
        <div className="p-4">Sidebar</div>
      </aside>

      <button
        suppressHydrationWarning
        className="absolute top-0 right-4 dark:text-white text-black"
        onClick={handleToggle}
      >
        {isSidebarOpen ? "Close" : "Open"}
      </button>
    </>
  );
}
