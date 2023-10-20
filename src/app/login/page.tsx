import { auth } from "@/lib/auth/lucia";
import * as context from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const authRequest = auth.handleRequest("GET", context);
  const session = await authRequest.validate();

  if (session) {
    redirect("/");
  }

  return (
    <>
      <a href="/api/auth/google/login">Sign in with Google</a>
    </>
  );
}
