"use client";

import Link from "next/link";
import { useAction } from "next-safe-action/hook";
import { useParams } from "next/navigation";
import { TrashIcon } from "@heroicons/react/24/outline";

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
  const deleteConversationAction = useAction(deleteConversation);

  return (
    <div className="conversations-scrollbar flex h-full flex-col gap-2 overflow-y-auto py-2 pr-1">
      {conversations.map((conversation, idx) => {
        return (
          <Link
            key={idx}
            href={`/chat/${conversation.id}`}
            className={`flex flex-row items-center justify-between rounded-md p-4 text-left
                  text-sm shadow-white/20 shadow-inset hover:bg-neutral-900
                  ${
                    conversationId === conversation.id
                      ? "bg-neutral-900"
                      : "hover:bg-neutral-900"
                  }`}
          >
            <span className="overflow-hidden text-ellipsis whitespace-nowrap">
              {conversation.title}
            </span>

            <button
              title="Delete Conversation"
              className="hover:text-red-500"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                deleteConversationAction.execute({
                  conversationId: conversation.id,
                });
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
