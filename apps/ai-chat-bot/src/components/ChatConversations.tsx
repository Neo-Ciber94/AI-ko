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
  deleteConversation,
  updateConversationTitle,
  generateConversationTitle,
} from "@/lib/actions/conversations";
import React, { useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/20/solid";
import { useToast } from "@/client/hooks/use-toast";
import TypeWriter from "./TypeWriter";
import { eventListener } from "@/client/events";
import type { Conversation } from "@/lib/database/types";

export default function ChatConversations({
  conversations,
}: {
  conversations: Conversation[];
}) {
  const [editing, setEditing] = useState<{
    conversationId: string;
    title: string;
  }>();

  return (
    <div className="conversations-scrollbar flex h-full flex-col gap-2 overflow-y-auto py-2 pr-1">
      {conversations.map((conversation) => {
        return (
          <ChatConversationItem
            key={conversation.id}
            conversation={conversation}
            setEditing={setEditing}
            editing={editing}
          />
        );
      })}
    </div>
  );
}

type Editing = {
  conversationId: string;
  title: string;
};

function ChatConversationItem({
  conversation,
  editing,
  setEditing,
}: {
  conversation: Conversation;
  editing?: Editing;
  setEditing: (editing: Editing | undefined) => void;
}) {
  const toast = useToast();
  const { conversationId } = useParams<{ conversationId: string }>();
  const [title, setTitle] = useState(conversation.title);
  const isCurrentConversation = conversationId === conversation.id;
  eventListener.conversationTitleChanged.useSubscription((event) => {
    if (conversation.id === event.conversationId) {
      setTitle(event.newTitle);
    }
  });

  return (
    <Link
      title={title}
      href={`/chat/${conversation.id}`}
      className={`group flex flex-row items-center justify-between gap-2 rounded-md p-4
        text-left text-sm shadow-white/20 shadow-inset hover:bg-neutral-900
        ${isCurrentConversation ? "bg-neutral-900" : "hover:bg-neutral-900"}`}
    >
      {editing && editing.conversationId === conversation.id ? (
        <input
          autoFocus
          className={
            "h-5 w-full overflow-hidden text-ellipsis whitespace-nowrap bg-transparent text-white outline-none"
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
        <TypeWriter
          text={title}
          className={`h-5 w-full cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap bg-transparent text-white outline-none`}
          startCompleted
        />
      )}

      <div className="flex flex-row items-center gap-2">
        {editing == null && (
          <button
            type="submit"
            title="Generate"
            className={`text-white/60 hover:text-white ${
              isCurrentConversation ? "block" : "hidden group-hover:block"
            } `}
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              const result = await generateConversationTitle({
                conversationId: conversation.id,
              });

              if (result) {
                setTitle(result.title);
              } else {
                toast.error("Failed to generate conversation title");
              }
            }}
          >
            <ArrowPathIcon className="h-4 w-4" />
          </button>
        )}

        {editing && editing.conversationId === conversation.id ? (
          <SaveButton
            isCurrentConversation={isCurrentConversation}
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              await updateConversationTitle({
                conversationId: editing.conversationId,
                title: editing.title,
              });

              setEditing(undefined);
              setTitle(editing.title);
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

              if (confirm("Delete conversation?")) {
                await deleteConversation({
                  conversationId: conversation.id,
                });
              }
            }}
          />
        )}
      </div>
    </Link>
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
      <CheckIcon className="h-4 w-4 opacity-80" />
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
      <PencilSquareIcon className="h-4 w-4 opacity-80" />
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
      <XMarkIcon className="h-4 w-4 opacity-80" />
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
      <TrashIcon className="h-4 w-4 opacity-80" />
    </button>
  );
}
