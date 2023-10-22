"use client";

import { isomorphicClient } from "@/lib/utils/isomorphic.client";
import { logOut, useSession } from "../providers/SessionProvider";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";

export default function Sidebar() {
  const { session } = useSession();
  const [isOpen] = isomorphicClient.useValue("isSidebarOpen");

  return (
    <aside className="relative z-20 h-full">
      <div
        className={`fixed left-0 z-20 h-full overflow-hidden whitespace-nowrap border-transparent bg-black
        text-white shadow-xl shadow-black/50 transition-all duration-300 sm:static ${
          isOpen ? "border-rainbow-bottom w-10/12 border-r sm:w-[300px]" : "w-0"
        }`}
      >
        <div className="flex h-full flex-col p-4">
          <span>Sidebar</span>

          {session && (
            <div className="mt-auto border-t border-t-violet-600 pt-4">
              <div className="flex flex-row items-center justify-between text-white">
                <span>{session.user.username}</span>
                <button
                  title="Log out"
                  className="shadow-inset rounded-md p-3 shadow-white/40 hover:bg-neutral-900"
                  onClick={logOut}
                >
                  <ArrowRightOnRectangleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
