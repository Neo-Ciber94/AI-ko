import { auth } from "@/lib/auth/lucia";
import { redirect } from "next/navigation";
import * as context from "next/headers";
import ChatInput from "./ChatInput";

export default async function ChatPage() {
  const authRequest = auth.handleRequest("GET", context);
  const session = await authRequest.validate();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto flex h-full w-full flex-col p-4">
      <div className="mt-auto flex w-full flex-row justify-center">
        <ChatInput />
      </div>
    </div>
  );
}
