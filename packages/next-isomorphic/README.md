# next-isomorphic

Share state between the client and server using cookies.

## Install

```bash
# npm
npm install next-isomorphic
```

```bash
# yarn
yarn add next-isomorphic
```

```bash
# pnpm
pnpm add next-isomorphic
```

## Usage

Define your initial state on the server

```ts
// isomorphic.server.ts
import { createIsomorphicStore } from "next-isomorphic/server";

export const appStore = createIsomorphicStore("myPrefix", {
  isSidebarOpen: true as boolean, // required because ts infer this as `true`
  isDark: true as boolean,
});

// Export the type to allow the client to read the state type
export type AppStore = ReturnType<typeof appStore>;
```

Declare a client for use the state client-side

```ts
// isomorphic.client.ts
"use client";

import { createIsomorphicClient } from "next-isomorphic/client";
import { type AppStore } from "./isomorphic.server";

export const isomorphicClient = createIsomorphicClient<AppStore>({
  // You can also listen for change events
  onChange({ newState }) {
    if (newState.isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  },
});
```

Use and change the state on the client. Any component
can listen for the changes and change the value and affect all the others consumers.

```tsx
'use client';

export function MyComponent() {
  const [isDark, setIsDark] = isomorphicClient.isDark.useValue();
  const [isSidebarOpen, setIsSidebarOpen] = isomorphicClient.isSidebarOpen.useValue();

  return <div>{/* jsx */}</div>;
}
```

## How it works?

The state is preserved using **insecure** cookies `(document.cookie)`, this can be set and read client and server side.

Because the cookies are not secure should not be used to store sensitive information, also cookies have a max size,
this depend on the browser but for *Google Chrome* this is around 4096 bytes.

<https://chromestatus.com/feature/4946713618939904>

The values to store should be `JSON` serializable, so values like `Date` cannot be store, instead you could store the date as a number `Date.now()` or convert the date to string for example using `date.toISOString()` and create the date using it.

## What information can I store?

Information like the user theme, language, and state for UI elements like if the sidebar is open or an element is visible can be store using the isomorphic store.
