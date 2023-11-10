import { FcGoogle } from "react-icons/fc";

export default function Login() {
  return (
    <div
      className="flex h-fit w-full flex-col gap-2 rounded-lg border
    border-gray-400/40 px-4 pb-8 pt-4 shadow-lg dark:border-neutral-500 xs:w-[400px]"
    >
      <div className="mb-2">
        <h1 className="text-xl font-bold">Login</h1>
        <p className="text-xs text-gray-500/80 dark:text-gray-400/70">
          To continue to the AIko
        </p>
      </div>
      <a
        href="/api/auth/google/login"
        className="flex w-full flex-row items-center gap-2 rounded-lg 
        border border-gray-400/40 p-2 hover:bg-neutral-400/20 dark:border-neutral-500 dark:hover:bg-neutral-800"
      >
        <span className="text-3xl">
          <FcGoogle />
        </span>
        <span className="text-sm">Login with Google</span>
      </a>
    </div>
  );
}
