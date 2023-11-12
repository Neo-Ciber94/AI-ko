import * as context from "next/headers";
import { auth } from "./lucia";
import { redirect } from "next/navigation";

export async function getSession() {
  const authRequest = auth.handleRequest("GET", context);
  const session = await authRequest.validate();
  return session;
}

export async function getRequiredSession(redirectTo = "/login") {
  const authRequest = auth.handleRequest("GET", context);
  const session = await authRequest.validate();

  if (session == null) {
    redirect(redirectTo);
  }

  return session;
}
