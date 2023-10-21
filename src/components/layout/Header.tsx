"use client";
import {
  Bars3Icon,
  MoonIcon,
  SunIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

import { isomorphicClient } from "@/lib/utils/isomorphic.client";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const [isOpen, setIsOpen] = isomorphicClient.useValue("isSidebarOpen");
  const [isDark, setIsDark] = isomorphicClient.useValue("isDark");

  const handleToggleSidebar = () => {
    setIsOpen((x) => !x);
  };

  const handleToggleDarkMode = () => {
    setIsDark((x) => !x);
    router.refresh();
  };

  return (
    <header className="flex h-12 w-full flex-row border-b-2 border-b-indigo-600 px-2">
      <div className="ml-auto flex flex-row items-center gap-4">
        <button onClick={handleToggleDarkMode}>
          {isDark ? (
            <SunIcon className="h-6 w-6 text-orange-400" />
          ) : (
            <MoonIcon className="h-6 w-6 text-violet-400" />
          )}
        </button>

        <button className="text-indigo-600" onClick={handleToggleSidebar}>
          {isOpen ? (
            <XMarkIcon className="h-8 w-8" />
          ) : (
            <Bars3Icon className="h-8 w-8" />
          )}
        </button>
      </div>
    </header>
  );
}
