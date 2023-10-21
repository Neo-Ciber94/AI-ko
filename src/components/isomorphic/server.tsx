import { cookies } from "next/headers";

export function createIsomorphicStore<S extends Record<string, JsonValue>>(
  prefix: string,
  state: S
) {
  if (!prefix || !prefix.trim()) {
    throw new Error("Isomorphic store cannot be empty or blank");
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

export type IsomorphicStore = ReturnType<
  ReturnType<typeof createIsomorphicStore>
>;
