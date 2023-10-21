"use client";
import { Session } from "lucia";
import { createContext, useContext } from "react";

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

export function useSession() {
  const { session } = useContext(sessionContext);

  return {
    session,
  };
}
