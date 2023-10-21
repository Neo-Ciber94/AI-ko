import { cookies } from "next/headers";

export function createIsomorphicStore<S extends Record<string, JsonValue>>(
  prefix: string,
  state: S
) {
  return {
    prefix,
    state,
  };
}

export type IsomorphicStore = ReturnType<typeof createIsomorphicStore>;

type IsomorphicStoreProps = {
  store: IsomorphicStore;
  children: React.ReactNode;
};

export function IsomorphicStoreProvider({
  store,
  children,
}: IsomorphicStoreProps) {
  const cookieValues = Array.from(cookies());
  const state: JsonObject = store.state;

  const prefix = `${store.prefix}-`;

  for (const [cookieName, cookie] of cookieValues) {
    if (cookieName.startsWith(prefix)) {
      const name = cookieName.slice(prefix.length);
      if (name in state) {
        try {
          state[name] = JSON.parse(cookie.value);
        } catch {
          // ignore
        }
      }
    }
  }

  return (
    <IsomorphicStoreProvider
      store={{
        prefix: store.prefix,
        state,
      }}
    >
      {children}
    </IsomorphicStoreProvider>
  );
}
