import { redirect } from "next/navigation";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

export default async function ChatConversationNotFoundPage() {
  return (
    <div className="flex h-full flex-row items-center justify-center p-4">
      <p
        className="mt-5 flex flex-row items-center gap-2 text-center
          font-mono text-2xl font-bold text-gray-500 opacity-60 dark:opacity-30"
      >
        <ExclamationCircleIcon className="w-1h-12 h-12" />
        <span>Conversation was not found</span>
      </p>
    </div>
  );
}
