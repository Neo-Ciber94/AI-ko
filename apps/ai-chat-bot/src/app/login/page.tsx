import { redirect } from "next/navigation";
import Login from "./Login";
import { getSession } from "@/lib/auth/utils";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  return (
    <div className="flex h-full w-full flex-row justify-center px-4 pt-20">
      <Login />
    </div>
  );
}
