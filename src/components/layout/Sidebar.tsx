"use client";

import { isomorphicClient } from "@/lib/utils/isomorphic.client";
import { logOut, useSession } from "../providers/SessionProvider";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";
import ChatBubbleOvalLeftEllipsisIcon from "@heroicons/react/24/outline/esm/ChatBubbleOvalLeftEllipsisIcon";
import { createConversation } from "./actions.server";
import { useAction } from "next-safe-action/hook";
import ChatConversations from "./ChatConversations";

export default function Sidebar() {
  const { session } = useSession();
  const [isOpen] = isomorphicClient.useValue("isSidebarOpen");
  const { execute, status } = useAction(createConversation);

  const handleCreateNewConversation = () => execute(undefined);

  return (
    <>
      {/* {isOpen && (
        <div className="fixed z-10 hidden h-full w-full bg-black/40 sm:hidden"></div>
      )} */}

      <aside className="relative z-20 h-full">
        <div
          className={`fixed left-0 z-20 h-full overflow-hidden whitespace-nowrap border-transparent bg-black
        text-white shadow-xl shadow-black/50 transition-all duration-300 sm:static ${
          isOpen ? "border-rainbow-bottom w-10/12 border-r sm:w-[300px]" : "w-0"
        }`}
        >
          <div className="group relative flex h-full flex-col px-2 py-4">
            <div className="flex flex-row border-b border-b-red-500">
              <button
                disabled={status === "executing"}
                onClick={handleCreateNewConversation}
                className="mb-2 flex w-full flex-row items-center gap-3 rounded-lg px-4 py-2 text-base hover:bg-neutral-900 disabled:cursor-wait"
              >
                <ChatBubbleOvalLeftEllipsisIcon
                  className="h-8 w-8"
                  style={{
                    transform: `rotateY(180deg)`,
                  }}
                />
                <span>New Conversation</span>
              </button>
            </div>

            <ChatConversations />

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
    </>
  );
}
