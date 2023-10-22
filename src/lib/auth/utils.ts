import * as context from "next/headers";
import { auth } from "./lucia";

export async function getSession() {
  const authRequest = auth.handleRequest("GET", context);
  const session = await authRequest.validate();
  return session;
}
