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
import React, { useMemo, useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/20/solid";
import { useToast } from "@/client/hooks/use-toast";
import TypeWriter from "./TypeWriter";
import { eventListener } from "@/client/events";
import type { Conversation } from "@/lib/database/types";
import { isomorphicClient } from "@/lib/utils/isomorphic.client";
import { useIsMobileScreen } from "@/client/hooks/use-is-small-screen";
import { EllipsisHorizontalIcon } from "@heroicons/react/24/solid";
import Dropdown from "./Dropdown";

export default function ChatConversations({
  conversations,
}: {
  conversations: Conversation[];
}) {
  const groups = useMemo(() => {
    const dateFormatOpts: Intl.DateTimeFormatOptions = {
      dateStyle: "medium",
    };

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const nowString = now.toLocaleDateString("en", dateFormatOpts);
    const yesterdayString = yesterday.toLocaleDateString("en", dateFormatOpts);

    const result = groupBy(conversations, (c) => {
      const createdAtString = new Date(c.createdAt).toLocaleDateString(
        "en",
        dateFormatOpts,
      );

      if (createdAtString === nowString) {
        return "Today";
      }

      if (createdAtString === yesterdayString) {
        return "Yesterday";
      }

      return createdAtString;
    });

    return result;
  }, [conversations]);

  return (
    <div className="conversations-scrollbar flex h-full flex-col gap-2 overflow-y-auto py-2 pr-1 pb-20">
      {groups.map(([key, conversations]) => {
        return (
          <ConversationGroup
            key={key}
            groupName={key}
            conversations={conversations}
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

type ConversationGroupProps = {
  groupName: string;
  conversations: Conversation[];
};

function ConversationGroup({
  groupName,
  conversations,
}: ConversationGroupProps) {
  const [editing, setEditing] = useState<{
    conversationId: string;
    title: string;
  }>();

  return (
    <div className="flex h-full flex-col gap-1 py-2 pr-1">
      <div className="bg-rainbow-bottom bg-fixed bg-clip-text text-sm font-medium text-transparent brightness-150 contrast-[60%]">
        {groupName}
      </div>
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
  const isMobileScreen = useIsMobileScreen();
  const [_, setSidebarOpen] = isomorphicClient.isSidebarOpen.useValue();
  const isCurrentConversation = conversationId === conversation.id;
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  eventListener.conversationTitleChanged.useSubscription((event) => {
    if (conversation.id === event.conversationId) {
      setTitle(event.newTitle);
    }
  });

  const handleCloseDropdown = () => {
    setAnchor(null);
  };

  const checkIsSmallScreen = () => {
    if (isMobileScreen) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      <Link
        title={title}
        href={`/chat/${conversation.id}`}
        className={`group flex flex-row items-center justify-between gap-2 rounded-md px-4 py-4
        text-left text-sm shadow-white/20 shadow-inset hover:bg-neutral-900
        ${isCurrentConversation ? "bg-neutral-900" : "hover:bg-neutral-900"}`}
        onClick={() => {
          checkIsSmallScreen();
        }}
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

        {editing == null && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setAnchor(e.currentTarget);
            }}
          >
            <EllipsisHorizontalIcon className="h-5 w-5 rounded-full hover:bg-gray-500/50" />
          </button>
        )}

        <div className="flex flex-row items-center gap-2">
          {editing && editing.conversationId === conversation.id && (
            <SaveButton
              isCurrentConversation={isCurrentConversation}
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (editing.title !== conversation.title) {
                  await updateConversationTitle({
                    conversationId: editing.conversationId,
                    title: editing.title,
                  });

                  setTitle(editing.title);
                }

                setEditing(undefined);
                checkIsSmallScreen();
              }}
            />
          )}

          {editing && editing.conversationId === conversation.id && (
            <CancelButton
              isCurrentConversation={isCurrentConversation}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setEditing(undefined);
              }}
            />
          )}
        </div>
      </Link>

      <Dropdown anchor={anchor} open={!!anchor} onClose={handleCloseDropdown}>
        <Dropdown.Item
          title="Edit Conversation"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleCloseDropdown();

            setEditing({
              conversationId: conversation.id,
              title: conversation.title,
            });
          }}
        >
          <div
            className={`flex flex-row items-center gap-2 hover:text-yellow-400`}
          >
            <PencilSquareIcon className="h-4 w-4" />
            <span>Rename</span>
          </div>
        </Dropdown.Item>

        <Dropdown.Item
          title="Generate Title"
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleCloseDropdown();

            const result = await generateConversationTitle({
              conversationId: conversation.id,
            });

            if (result) {
              setTitle(result.title);
              checkIsSmallScreen();
            } else {
              toast.error("Failed to generate conversation title");
            }
          }}
        >
          <div className={`flex flex-row items-center gap-2 text-white`}>
            <ArrowPathIcon className="h-4 w-4" />
            <span>Generate</span>
          </div>
        </Dropdown.Item>

        <Dropdown.Item
          title="Delete Conversation"
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleCloseDropdown();

            if (confirm("Delete conversation?")) {
              await deleteConversation({
                conversationId: conversation.id,
              });
            }
          }}
        >
          <div className={`flex flex-row items-center gap-2 text-red-500`}>
            <TrashIcon className="h-4 w-4 opacity-80" />
            <span>Delete</span>
          </div>
        </Dropdown.Item>
      </Dropdown>
    </>
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

// Utils

function groupBy<T, TKey>(items: T[], keySelector: (item: T) => TKey) {
  const groups = new Map<TKey, T[]>();

  for (const item of items) {
    const key = keySelector(item);
    const groupItems = groups.get(key) || [];
    groupItems.push(item);
    groups.set(key, groupItems);
  }

  return Array.from(groups.entries());
}
