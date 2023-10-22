import { auth } from "@/lib/auth/lucia";
import { redirect } from "next/navigation";
import * as context from "next/headers";

export default async function ChatPage() {
  const authRequest = auth.handleRequest("GET", context);
  const session = await authRequest.validate();

  if (!session) {
    redirect("/login");
  }

  return <p>Chat page</p>;
}
