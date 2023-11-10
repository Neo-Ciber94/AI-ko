"use client";
import {
  Bars3Icon,
  MoonIcon,
  SunIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

import { isomorphicClient } from "@/lib/utils/isomorphic.client";
import { logOut } from "./providers/SessionProvider";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

type HeaderProps = {
  showSidebarControls?: boolean;
  showLogout?: boolean;
};

export default function Header({
  showLogout,
  showSidebarControls,
}: HeaderProps) {
  const [isOpen, setIsOpen] = isomorphicClient.isSidebarOpen.useValue();
  const [isDark, setIsDark] = isomorphicClient.isDark.useValue();

  const handleToggleSidebar = () => {
    setIsOpen((x) => !x);
  };

  const handleToggleDarkMode = () => {
    setIsDark((x) => !x);
  };

  return (
    <header>
      <div className="border-rainbow-right flex h-16 w-full flex-row items-center border-b bg-black px-2">
        <Logo />
        <div className="ml-auto flex flex-row items-center gap-2">
          {showLogout && (
            <button
              onClick={logOut}
              title="Log out"
              className="rounded-md p-3 shadow-white/40 shadow-inset hover:bg-neutral-900"
            >
              <ArrowRightOnRectangleIcon className="h-6 w-6 text-white" />
            </button>
          )}

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

function Logo() {
  return (
    <Link href="/">
      <h1 className="bg-clip-text font-mono text-2xl font-bold text-white">
        AIko
      </h1>
    </Link>
  );
}
