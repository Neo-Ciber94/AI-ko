import { auth } from "@/lib/auth/lucia";
import { redirect } from "next/navigation";
import * as context from "next/headers";
import Chat from "./Chat";

export default async function ChatPage() {
  const authRequest = auth.handleRequest("GET", context);
  const session = await authRequest.validate();

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
