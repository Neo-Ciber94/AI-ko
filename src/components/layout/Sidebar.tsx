"use client";

import { isomorphicClient } from "@/lib/utils/isomorphic.client";

export default function Sidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = isomorphicClient.useValue("sidebarOpen");

  const handleToggle = () => {
    setIsSidebarOpen((x) => !x);
  };

  return (
    <>
      <aside
        className={`bg-violet-800 text-white transition-all overflow-hidden duration-300 h-full shadow-xl sm:static fixed left-0 ${
          isSidebarOpen ? "w-[300px]" : "w-0"
        }`}
      >
        <div className="p-4">Sidebar</div>
      </aside>

      <button
        className="absolute top-0 right-4 dark:text-white text-black"
        onClick={handleToggle}
      >
        {isSidebarOpen ? "Close" : "Open"}
      </button>
    </>
  );
}
