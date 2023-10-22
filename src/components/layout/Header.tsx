"use client";
import {
  Bars3Icon,
  MoonIcon,
  SunIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

import { isomorphicClient } from "@/lib/utils/isomorphic.client";
import { useRouter } from "next/navigation";

type HeaderProps = {
  showSidebarControls?: boolean;
};

export default function Header({ showSidebarControls }: HeaderProps) {
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
    <header className="flex h-16 w-full flex-row items-center bg-indigo-800 px-2">
      <h1 className="bg-clip-text font-mono text-3xl font-bold text-white">
        AIChatbot
      </h1>

      <div className="ml-auto flex flex-row items-center gap-2">
        <button
          onClick={handleToggleDarkMode}
          className="rounded-md p-2 hover:bg-indigo-950"
        >
          {isDark ? (
            <SunIcon className="h-6 w-6 text-orange-400" />
          ) : (
            <MoonIcon className="h-6 w-6 text-violet-400" />
          )}
        </button>

        {showSidebarControls && (
          <button
            className="rounded-md p-2 text-white hover:bg-indigo-950"
            onClick={handleToggleSidebar}
          >
            {isOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        )}
      </div>
    </header>
  );
}
