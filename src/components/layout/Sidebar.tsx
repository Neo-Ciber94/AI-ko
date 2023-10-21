"use client";

import { isomorphicClient } from "@/lib/utils/isomorphic.client";

export default function Sidebar() {
  const [isOpen] = isomorphicClient.useValue("isSidebarOpen");

  return (
    <aside
      className={`fixed left-0 z-10 h-full overflow-hidden bg-indigo-800 
        text-white shadow-xl shadow-black/50 transition-all duration-300 sm:static ${
          isOpen ? "w-10/12 sm:w-[300px]" : "w-0"
        }`}
    >
      <div className="p-4">Sidebar</div>
    </aside>
  );
}
