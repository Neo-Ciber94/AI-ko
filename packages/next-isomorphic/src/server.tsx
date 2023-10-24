import { cookies } from "next/headers";
import { type JsonValue } from ".";

// type IsomorphicState = {
//   [key: string]: JsonValue | (() => JsonValue);
// };

/**
 * Create a store that maintains state an state between the server and client.
 * @param prefix The prefix used for the cookies.
 * @param initialState The initial state.
 * @returns A function that create the store server side.
 */
export function createIsomorphicStore<S extends Record<string, JsonValue>>(
  prefix: string,
  initialState: S,
) {
  if (!prefix || !prefix.trim()) {
    throw new Error("Isomorphic store prefix cannot be blank or empty");
  }

  const store = function () {
    const cookieValues = Array.from(cookies());
    const cookiePrefix = `${prefix}/`;

    for (const [cookieName, cookie] of cookieValues) {
      if (!cookieName.startsWith(cookiePrefix)) {
        continue;
      }

      const name = cookieName.slice(cookiePrefix.length);

      try {
        initialState[name as keyof typeof initialState] = JSON.parse(
          cookie.value,
        );
      } catch {
        // ignore
      }
    }

    return {
      prefix,
      state: initialState,
    };
  };

  /**
   * Sets an isomorphic value server-side. This should be used in an API handler.
   * @param name The name of the value.
   * @param value The value.
   */
  store.set = <K extends keyof S>(name: K, value: S[K]) => {
    const key = `${prefix}/${String(name)}`;
    cookies().set(key, JSON.stringify(value));
  };

  /**
   * Reads an isomorphic value server-side.
   * @param name The name of the value.
   */
  store.get = <K extends keyof S>(name: K) => {
    const key = `${prefix}/${String(name)}`;
    const json = cookies().get(key);

    if (!json) {
      return initialState[name];
    }

    try {
      return JSON.parse(json.value) as S[K];
    } catch {
      return initialState[name];
    }
  };

  return store;
}

/**
 * The isomorphic store type.
 */
export type IsomorphicStore = ReturnType<
  ReturnType<typeof createIsomorphicStore>
>;

/**
 
const store = createIsomorphicStore("prefix", {
  schema: z.object({
    num: z.number(),
    bool: z.boolean(),
    text: z.string().min(10) 
  }),
  initialValue: {

  }
})
 */
