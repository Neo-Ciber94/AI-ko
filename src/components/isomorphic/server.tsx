import { cookies } from "next/headers";

/**
 * Create a store that maintains state an state between the server and client.
 * @param prefix The prefix used for the cookies.
 * @param state The initial state.
 * @returns A function that create the store server side.
 */
export function createIsomorphicStore<S extends Record<string, JsonValue>>(
  prefix: string,
  state: S
) {
  if (!prefix || !prefix.trim()) {
    throw new Error("Isomorphic store prefix cannot be blank or empty");
  }

  return () => {
    const cookieValues = Array.from(cookies());
    const cookiePrefix = `${prefix}/`;

    for (const [cookieName, cookie] of cookieValues) {
      if (cookieName.startsWith(cookiePrefix)) {
        const name = cookieName.slice(cookiePrefix.length);

        try {
          state[name as keyof typeof state] = JSON.parse(cookie.value);
        } catch {
          // ignore
        }
      }
    }

    return {
      prefix,
      state,
    };
  };
}

/**
 * The isomorphic store type.
 */
export type IsomorphicStore = ReturnType<
  ReturnType<typeof createIsomorphicStore>
>;
