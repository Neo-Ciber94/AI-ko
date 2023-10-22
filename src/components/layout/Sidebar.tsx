"use client";

import { isomorphicClient } from "@/lib/utils/isomorphic.client";
import { useSession } from "../providers/SessionProvider";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";

export default function Sidebar() {
  const { session, logOut } = useSession();
  const [isOpen] = isomorphicClient.useValue("isSidebarOpen");

  return (
    <aside
      className={`fixed left-0 z-10 h-full overflow-hidden bg-indigo-800 
        text-white shadow-xl shadow-black/50 transition-all duration-300 sm:static ${
          isOpen ? "w-10/12 sm:w-[300px]" : "w-0"
        }`}
    >
      <div className="flex h-full flex-col p-4">
        <span>Sidebar</span>

        {session && (
          <div className="mt-auto border-t border-t-white pt-4">
            <div className="flex flex-row items-center justify-between text-white">
              <span>{session.user.username}</span>
              <button
                className="rounded-md p-2 hover:bg-indigo-950"
                onClick={logOut}
              >
                <ArrowRightOnRectangleIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
