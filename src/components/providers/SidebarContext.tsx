"use client";

import { setCookie } from "@/client/utils/functions";
import { COOKIE_SIDEBAR_OPEN } from "@/lib/common/constants";
import {
  PropsWithChildren,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

type SidebarContext = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (value: SetStateAction<boolean>) => void;
};

const sidebarContext = createContext<SidebarContext>({
  isSidebarOpen: true,
  setIsSidebarOpen: () => {},
});

type SidebarProviderProps = {
  isOpen?: boolean;
};

export function SidebarProvider({
  isOpen = true,
  children,
}: PropsWithChildren<SidebarProviderProps>) {
  const [open, setOpen] = useState(isOpen);

  const setIsSidebarOpen = useCallback(
    (newValue: SetStateAction<boolean>) => {
      const value = newValue instanceof Function ? newValue(open) : newValue;
      setOpen(value);
      setCookie(COOKIE_SIDEBAR_OPEN, String(value));
    },
    [open]
  );

  return (
    <sidebarContext.Provider
      value={{
        isSidebarOpen: open,
        setIsSidebarOpen,
      }}
    >
      {children}
    </sidebarContext.Provider>
  );
}

export function useSidebar() {
  const { isSidebarOpen, setIsSidebarOpen } = useContext(sidebarContext);

  return { isSidebarOpen, setIsSidebarOpen };
}
