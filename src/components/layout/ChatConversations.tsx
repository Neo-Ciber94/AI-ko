import { deleteConversation, getConversations } from "./actions.server";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { TrashIcon } from "@heroicons/react/24/outline";

async function action(formData: FormData) {
  "use server";

  const conversationId = formData.get("conversationId")?.toString() || "";
  await deleteConversation(conversationId);
  revalidatePath("/");
}

export async function ChatConversations() {
  const conversations = await getConversations();

  return (
    <div className="conversations-scrollbar flex h-full flex-col gap-2 py-2 pr-1 overflow-y-auto">
      {conversations.map((conversation, idx) => {
        return (
          <Link
            key={idx}
            href={`/chat/${conversation.id}`}
            className="shadow-inset flex flex-row items-center justify-between rounded-md p-4
                 text-left text-sm shadow-white/20 hover:bg-neutral-900"
          >
            <span className="overflow-hidden text-ellipsis whitespace-nowrap">
              {conversation.title}
            </span>

            <form action={action}>
              <input
                readOnly
                name="conversationId"
                value={conversation.id}
                hidden
              />
              <button
                title="Delete Conversation"
                className="hover:text-red-500"
                type="submit"
              >
                <TrashIcon className="h-5 w-5 opacity-80" />
              </button>
            </form>
          </Link>
        );
      })}
    </div>
  );
}
