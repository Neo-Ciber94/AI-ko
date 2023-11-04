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

export const appStore = createIsomorphicStore("aiChatbot", {
  isSidebarOpen: true as boolean,
  isDark: true as boolean,
});

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
