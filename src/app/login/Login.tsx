import { FcGoogle } from "react-icons/fc";

export default function Login() {
  return (
    <div
      className="flex w-full flex-col gap-2 rounded-lg border h-fit
    border-gray-300 px-4 pb-8 pt-4 shadow-lg dark:border-indigo-500 xs:w-[400px]"
    >
      <div className="mb-2">
        <h1 className="text-xl font-bold">Login</h1>
        <p className="text-xs text-gray-400/70">To continue to the AIChatbot</p>
      </div>
      <a
        href="/api/auth/google/login"
        className="flex w-full flex-row items-center gap-2 rounded-lg 
        border border-gray-300 p-2 hover:bg-indigo-400/20 dark:border-indigo-500 dark:hover:bg-indigo-800"
      >
        <span className="text-3xl">
          <FcGoogle />
        </span>
        <span className="text-sm">Login with Google</span>
      </a>
    </div>
  );
}
