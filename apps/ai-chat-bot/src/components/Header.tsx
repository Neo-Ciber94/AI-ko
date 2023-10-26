"use client";
import {
  Bars3Icon,
  MoonIcon,
  SunIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

import { isomorphicClient } from "@/lib/utils/isomorphic.client";

type HeaderProps = {
  showSidebarControls?: boolean;
};

export default function Header({ showSidebarControls }: HeaderProps) {
  const [isOpen, setIsOpen] = isomorphicClient.useValue("isSidebarOpen");
  const [isDark, setIsDark] = isomorphicClient.useValue("isDark");

  const handleToggleSidebar = () => {
    setIsOpen((x) => !x);
  };

  const handleToggleDarkMode = () => {
    setIsDark((x) => !x);
  };

  return (
    <header>
      <div className="border-rainbow-right flex h-16 w-full flex-row items-center border-b bg-black px-2">
        <h1 className="bg-clip-text font-mono text-2xl font-bold text-white">
          AIChatbot
        </h1>

        <div className="ml-auto flex flex-row items-center gap-2">
          <button
            onClick={handleToggleDarkMode}
            title="Toggle dark mode"
            className="rounded-md p-3 shadow-white/40 shadow-inset hover:bg-neutral-900"
          >
            {isDark ? (
              <SunIcon className="h-6 w-6 text-orange-400" />
            ) : (
              <MoonIcon className="h-6 w-6 text-violet-400" />
            )}
          </button>

          {showSidebarControls && (
            <button
              title={`${isOpen ? "Close Sidebar" : "Expand Sidebar"}`}
              className="rounded-md p-3 text-white shadow-white/40 shadow-inset hover:bg-neutral-900"
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
      </div>
    </header>
  );
}