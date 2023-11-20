"use client";

import { isomorphicClient } from "@/lib/utils/isomorphic.client";
import { logOut, useSession } from "./providers/SessionProvider";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";
import ChatBubbleOvalLeftEllipsisIcon from "@heroicons/react/24/outline/esm/ChatBubbleOvalLeftEllipsisIcon";
import ChatConversations from "./ChatConversations";
import { createConversation } from "@/lib/actions/conversations";
import { useFormStatus } from "react-dom";
import LoadingSpinner from "./LoadingSpinner";
import type { Conversation } from "@/lib/database/types";
import { useIsMobileScreen } from "@/client/hooks/use-is-small-screen";
import { useEffect, useMemo, useRef } from "react";
import {
  COOKIE_CONVERSATION_CREATED,
  breakpoints,
} from "@/lib/common/constants";
import { getCookie, removeCookie } from "@/client/utils/functions";
import { useScreenSize } from "@/client/hooks/use-screen-size";
import { useMediaQuery } from "@/client/hooks/use-media-query";

export default function Sidebar({
  conversations,
}: {
  conversations: Conversation[];
}) {
  const { session } = useSession();
  const isMobileScreen = useIsMobileScreen();
  const [isOpen, setIsOpen] = isomorphicClient.isSidebarOpen.useValue();
  const sidebarCheckForMobileScreen = useRef(false);
  const isSmallScreen = useMediaQuery(`(max-width: ${breakpoints.sm})`);
  const screenSize = useScreenSize();
  const sidebarWidth = useMemo(() => {
    return isSmallScreen ? `${screenSize.width * (10 / 12)}px` : "300px";
  }, [isSmallScreen, screenSize.width]);

  useEffect(() => {
    if (isMobileScreen && !sidebarCheckForMobileScreen.current) {
      sidebarCheckForMobileScreen.current = true;
      setIsOpen(false);
    }
  }, [isMobileScreen, setIsOpen]);

  return (
    <>
      {isOpen && (
        <div
          className="visible fixed z-10 h-full w-full bg-black/40 sm:invisible"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      <nav className="relative z-20 h-full">
        <div
          suppressHydrationWarning
          className={`border-rainbow-bottom fixed h-full overflow-hidden transition-all duration-300 sm:static ${
            isOpen ? "border-r" : ""
          }`}
          style={{
            width: isOpen ? sidebarWidth : "0px",
          }}
        >
          <div
            className={`z-20 h-full  overflow-hidden whitespace-nowrap bg-black
         text-white shadow-xl shadow-black/50 `}
            style={{
              width: sidebarWidth,
            }}
          >
            <div className="relative flex h-full flex-col px-2 py-4">
              <div className="flex w-full flex-row border-b border-b-red-500">
                <form action={createConversation.formAction} className="w-full">
                  <CreateConversationButton />
                </form>
              </div>

              <ChatConversations conversations={conversations} />

              {session && (
                <div className="mt-auto border-t border-t-violet-600 pt-4">
                  <div className="flex flex-row items-center justify-between text-white">
                    <span>{session.user.username}</span>
                    <button
                      title="Log out"
                      className="rounded-md p-3 shadow-white/40 shadow-inset hover:bg-neutral-900"
                      onClick={logOut}
                    >
                      <ArrowRightOnRectangleIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

function CreateConversationButton() {
  const { pending } = useFormStatus();
  const isMobileScreen = useIsMobileScreen();
  const [_, setIsOpen] = isomorphicClient.isSidebarOpen.useValue();

  useEffect(() => {
    if (pending) {
      return;
    }

    const conversationWasCreated =
      getCookie(COOKIE_CONVERSATION_CREATED) === "1";
    if (conversationWasCreated && isMobileScreen) {
      removeCookie(COOKIE_CONVERSATION_CREATED);
      setIsOpen(false);
    }
  }, [isMobileScreen, pending, setIsOpen]);

  return (
    <button
      disabled={pending}
      type="submit"
      className="mb-2 flex w-full flex-row items-center gap-3 rounded-lg px-4 py-2 text-base hover:bg-neutral-900 disabled:cursor-wait"
    >
      <ChatBubbleOvalLeftEllipsisIcon
        className="h-8 w-8"
        style={{
          transform: `rotateY(180deg)`,
        }}
      />
      <span>New Conversation</span>
      {pending && <LoadingSpinner size={18} />}
    </button>
  );
}
