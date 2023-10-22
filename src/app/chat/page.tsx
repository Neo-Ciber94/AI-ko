import { redirect } from "next/navigation";
import Chat from "./Chat";
import { getSession } from "@/lib/auth/utils";

export default async function ChatPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto">
      <div className="mt-auto flex w-full flex-row justify-center">
        <Chat />
      </div>
    </div>
  );
}
