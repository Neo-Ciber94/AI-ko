"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

import {
  type Conversation,
  deleteConversation,
} from "@/lib/actions/conversations";

export default function ChatConversations({
  conversations,
}: {
  conversations: Conversation[];
}) {
  const { conversationId } = useParams<{ conversationId: string }>();

  return (
    <div className="conversations-scrollbar flex h-full flex-col gap-2 overflow-y-auto py-2 pr-1">
      {conversations.map((conversation, idx) => {
        const isCurrentConversation = conversationId === conversation.id;

        return (
          <Link
            key={idx}
            href={`/chat/${conversation.id}`}
            className={`group flex flex-row items-center justify-between gap-2 rounded-md p-4
                  text-left text-sm shadow-white/20 shadow-inset hover:bg-neutral-900
                  ${
                    isCurrentConversation
                      ? "bg-neutral-900"
                      : "hover:bg-neutral-900"
                  }`}
          >
            <span className="overflow-hidden text-ellipsis whitespace-nowrap">
              {conversation.title}
            </span>

            <button
              title="Edit Conversation"
              className={`hover:text-yellow-400 ${
                isCurrentConversation ? "block" : "hidden group-hover:block"
              } `}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <PencilSquareIcon className="h-5 w-5 opacity-80" />
            </button>

            <button
              title="Delete Conversation"
              className={`hover:text-red-500 ${
                isCurrentConversation ? "block" : "hidden group-hover:block"
              } `}
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                await deleteConversation({ conversationId: conversation.id });
              }}
            >
              <TrashIcon className="h-5 w-5 opacity-80" />
            </button>
          </Link>
        );
      })}
    </div>
  );
}
