"use client";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";

import { isomorphicClient } from "@/lib/utils/isomorphic.client";

export default function Header() {
  const [isOpen, setIsOpen] = isomorphicClient.useValue("sidebarOpen");

  const handleToggleSidebar = () => {
    setIsOpen((x) => !x);
  };

  return (
    <header className="flex h-12 w-full flex-row border-b-2 border-b-indigo-600 px-2">
      <button className="ml-auto text-indigo-600" onClick={handleToggleSidebar}>
        {isOpen ? (
          <XMarkIcon className="h-8 w-8" />
        ) : (
          <Bars3Icon className="h-8 w-8" />
        )}
      </button>
    </header>
  );
}
