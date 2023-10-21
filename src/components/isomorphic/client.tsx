"use client";

import React, {
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { type IsomorphicStore } from "./server";
import { setCookie } from "@/client/utils/functions";

const isomorphicStoreContext = createContext<{
  store: IsomorphicStore;
  setStore: (store: SetStateAction<IsomorphicStore>) => void;
}>({
  store: {
    prefix: "",
    state: {},
  },
  setStore: () => {},
});

type IsomorphicStoreProviderProps = {
  store: IsomorphicStore;
  children: React.ReactNode;
};

export function IsomorphicStoreProvider({
  children,
  ...rest
}: IsomorphicStoreProviderProps) {
  const [store, setStore] = useState(rest.store);

  return (
    <isomorphicStoreContext.Provider value={{ store, setStore }}>
      {children}
    </isomorphicStoreContext.Provider>
  );
}

export function createIsomorphicClient<S extends IsomorphicStore>() {
  return {
    useState<K extends keyof S["state"]>(name: K) {
      type Value = S["state"][K];

      const { store, setStore } = useContext(isomorphicStoreContext);

      const setValue = useCallback(
        (newValue: Value) => {
          setStore((prev) => {
            return {
              ...prev,
              state: {
                ...prev.state,
                [name]: newValue,
              },
            };
          });

          const cookieName = `${store.prefix}-${String(name)}`;
          setCookie(cookieName, JSON.stringify(newValue));
        },

        [name, setStore, store.prefix]
      );

      const value = useMemo(() => {
        const key = name as keyof typeof store;
        return store[key];
      }, [name, store]);

      return [value, setValue] as [Value, SetStateAction<Value>];
    },
  };
}
