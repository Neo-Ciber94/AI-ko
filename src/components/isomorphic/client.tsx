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

/**
 * Initializes the isomorphic context to share state between client and server.
 */
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

/**
 * Creates a client to consume an isomorphic store.
 */
export function createIsomorphicClient<S extends IsomorphicStore>() {
  return {
    /**
     * Returns a consumer that updates the isomorphic store.
     * @param name The name of the state value.
     */
    useIsomorphicStore<K extends keyof S["state"]>(name: K) {
      type TValue = S["state"][K];
      type TKey = keyof typeof store.state;

      const { store, setStore } = useContext(isomorphicStoreContext);

      const setValue = useCallback(
        (newValue: SetStateAction<TValue>) => {
          const prevValue = store.state[name as TKey];
          const value =
            newValue instanceof Function
              ? newValue(prevValue as TValue)
              : newValue;

          setStore((prev) => {
            return {
              ...prev,
              state: {
                ...prev.state,
                [name]: value,
              },
            };
          });

          const cookieName = `${store.prefix}/${String(name)}`;
          setCookie(cookieName, JSON.stringify(value));
        },

        [name, setStore, store.prefix, store.state]
      );

      const value = useMemo(() => {
        const key = name as TKey;
        return store.state[key]!;
      }, [name, store]);

      // prettier-ignore
      return [value, setValue] as [TValue, (newValue: SetStateAction<TValue>) => void];
    },
  };
}
