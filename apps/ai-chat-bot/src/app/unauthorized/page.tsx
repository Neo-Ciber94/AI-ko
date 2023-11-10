import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "AIko | Unauthorized",
};

export default function UnauthorizedPage() {
  return (
    <div className="flex h-full w-full flex-row justify-center px-4 pt-20">
      <span className="text-center font-mono text-base text-white/60 sm:text-3xl">
        Your user is unauthorized to access this app
      </span>
    </div>
  );
}
