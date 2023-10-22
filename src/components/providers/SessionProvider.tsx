"use client";
import { Session } from "lucia";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext } from "react";

type SessionContext = {
  session: Session | null;
};

const sessionContext = createContext<SessionContext>({
  session: null,
});

type SessionProviderProps = {
  session: Session | null;
  children: React.ReactNode;
};

export function SessionProvider({ session, children }: SessionProviderProps) {
  return (
    <sessionContext.Provider value={{ session }}>
      {children}
    </sessionContext.Provider>
  );
}

export async function logOut() {
  const res = await fetch("/api/auth/google/logout", {
    method: "POST",
    redirect: "manual",
  });

  if (res.status === 0) {
    window.location.href = `${window.location.origin}/login`;
  }
}

export function signIn() {
  window.location.href = `${window.location.origin}/api/auth/google/login`;
}

export function useSession() {
  const { session } = useContext(sessionContext);

  return {
    session,
  };
}
