import Form from "@/components/Form";
import { auth } from "@/lib/auth/lucia";
import * as context from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const authRequest = auth.handleRequest("GET", context);
  const session = await authRequest.validate();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="w-full text-right">
      <h1>Profile</h1>
      <p>User id: {session.user.userId}</p>
      <p>User email: {session.user.username}</p>
      <Form action="/api/auth/google/logout">
        <input type="submit" value="Sign out" />
      </Form>
    </div>
  );
}
