import { type Metadata } from "next";
import Login from "./Login";

export const metadata: Metadata = {
  title: "AI Chatbot | Login",
};

export default function LoginPage() {
  return (
    <div className="flex h-full w-full flex-row justify-center px-4 pt-20">
      <Login />
    </div>
  );
}
