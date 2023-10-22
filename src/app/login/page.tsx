import { auth } from "@/lib/auth/lucia";
import * as context from "next/headers";
import { redirect } from "next/navigation";
import Login from "./Login";

export default async function LoginPage() {
  const authRequest = auth.handleRequest("GET", context);
  const session = await authRequest.validate();

  if (session) {
    redirect("/");
  }

  return (
    <div className="flex h-full w-full flex-row justify-center px-4 pt-20">
      <Login />
    </div>
  );
}
