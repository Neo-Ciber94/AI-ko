"use client";

import React, {
  type SetStateAction,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { type IsomorphicStore } from "./server";
import { getCookie, setCookie } from ".";

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
 * Options to create a isomorphic client store.
 */
type CreateIsomorphicClientOptions<S extends IsomorphicStore> = {
  /**
   * Called each time the store state changes on the client.
   * @param newState The new state.
   */
  onChange?: (changes: { newState: S["state"]; prevState: S["state"] }) => void;
};

type CreateIsomorphicClient<S extends IsomorphicStore> = {
  [K in keyof S["state"]]: {
    useValue: () => [
      S["state"][K],
      (newValue: SetStateAction<S["state"][K]>) => void,
    ];
  };
};

/**
 * Creates a client to consume an isomorphic store.
 * @param options Options to pass to the store.
 */
export function createIsomorphicClient<S extends IsomorphicStore>(
  options?: CreateIsomorphicClientOptions<S>,
): CreateIsomorphicClient<S> {
  const { onChange } = options || {};

  function createUseValueHook<K extends keyof S["state"]>(name: K) {
    type TValue = S["state"][K];
    type TKey = keyof typeof store.state;

    const { store, setStore } = useContext(isomorphicStoreContext);
    const cookieName = `${store.prefix}/${String(name)}`;

    const setValue = useCallback(
      (newValue: SetStateAction<TValue>) => {
        const prevValue = store.state[name as TKey] as S["state"];
        const value =
          newValue instanceof Function
            ? newValue(prevValue as TValue)
            : newValue;

        setStore((prev) => {
          const newState = {
            ...prev.state,
            [name]: value,
          };

          if (onChange) {
            onChange({
              newState: { ...newState },
              prevState: { ...prevValue },
            });
          }

          return {
            ...prev,
            state: newState,
          };
        });

        setCookie(cookieName, JSON.stringify(value));
      },

      [name, setStore, store],
    );

    const value = useMemo(() => {
      let value: TValue;
      const key = name as TKey;

      try {
        const cookieValue = getCookie(cookieName);
        if (cookieValue) {
          value = JSON.parse(cookieValue);
        } else {
          value = store.state[key]! as TValue;
        }
      } catch {
        value = store.state[key]! as TValue;
        if (typeof document !== "undefined") {
          setCookie(cookieName, JSON.stringify(value));
        }
      }

      return value;
    }, [name, store]);

    // prettier-ignore
    return [value, setValue] as [TValue, (newValue: SetStateAction<TValue>) => void];
  }

  return new Proxy({} as CreateIsomorphicClient<S>, {
    get(_, key) {
      return {
        /**
         * Returns a consumer that updates a value in the isomorphic store.
         */
        useValue() {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return createUseValueHook(key as any);
        },
      };
    },
  });
}
