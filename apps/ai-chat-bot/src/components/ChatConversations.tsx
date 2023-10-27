"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CheckIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import {
  type Conversation,
  deleteConversation,
  updateConversation,
} from "@/lib/actions/conversations";
import React, { useState } from "react";

export default function ChatConversations({
  conversations,
}: {
  conversations: Conversation[];
}) {
  const { conversationId } = useParams<{ conversationId: string }>();
  const [editing, setEditing] = useState<{
    conversationId: string;
    title: string;
  }>();

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
            {editing && editing.conversationId === conversation.id ? (
              <input
                autoFocus
                className={
                  "w-full overflow-hidden text-ellipsis whitespace-nowrap bg-transparent text-white outline-none"
                }
                value={editing.title}
                onChange={(e) => {
                  setEditing({
                    conversationId: conversation.id,
                    title: e.target.value,
                  });
                }}
              />
            ) : (
              <span
                className={`w-full cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap bg-transparent text-white outline-none`}
              >
                {conversation.title}
              </span>
            )}

            <div className="flex flex-row items-center gap-2">
              {editing && editing.conversationId === conversation.id ? (
                <SaveButton
                  isCurrentConversation={isCurrentConversation}
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    await updateConversation({
                      conversationId: editing.conversationId,
                      title: editing.title,
                    });

                    setEditing(undefined);
                  }}
                />
              ) : (
                <EditButton
                  isCurrentConversation={isCurrentConversation}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setEditing({
                      conversationId: conversation.id,
                      title: conversation.title,
                    });
                  }}
                />
              )}

              {editing && editing.conversationId === conversation.id ? (
                <CancelButton
                  isCurrentConversation={isCurrentConversation}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setEditing(undefined);
                  }}
                />
              ) : (
                <DeleteButton
                  isCurrentConversation={isCurrentConversation}
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    await deleteConversation({
                      conversationId: conversation.id,
                    });
                  }}
                />
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function SaveButton({
  isCurrentConversation,
  onClick,
}: {
  isCurrentConversation: boolean;
  onClick: (event: React.MouseEvent) => void;
}) {
  return (
    <button
      title="Save"
      className={`hover:text-green-500 ${
        isCurrentConversation ? "block" : "hidden group-hover:block"
      } `}
      onClick={onClick}
    >
      <CheckIcon className="h-5 w-5 opacity-80" />
    </button>
  );
}

function EditButton({
  isCurrentConversation,
  onClick,
}: {
  isCurrentConversation: boolean;
  onClick: (event: React.MouseEvent) => void;
}) {
  return (
    <button
      title="Edit Conversation"
      className={`hover:text-yellow-400 ${
        isCurrentConversation ? "block" : "hidden group-hover:block"
      } `}
      onClick={onClick}
    >
      <PencilSquareIcon className="h-5 w-5 opacity-80" />
    </button>
  );
}

function CancelButton({
  isCurrentConversation,
  onClick,
}: {
  isCurrentConversation: boolean;
  onClick: (event: React.MouseEvent) => void;
}) {
  return (
    <button
      title="Cancel"
      className={`hover:text-red-500 ${
        isCurrentConversation ? "block" : "hidden group-hover:block"
      } `}
      onClick={onClick}
    >
      <XMarkIcon className="h-5 w-5 opacity-80" />
    </button>
  );
}

function DeleteButton({
  isCurrentConversation,
  onClick,
}: {
  isCurrentConversation: boolean;
  onClick: (event: React.MouseEvent) => void;
}) {
  return (
    <button
      title="Delete Conversation"
      className={`hover:text-red-500 ${
        isCurrentConversation ? "block" : "hidden group-hover:block"
      } `}
      onClick={onClick}
    >
      <TrashIcon className="h-5 w-5 opacity-80" />
    </button>
  );
}
