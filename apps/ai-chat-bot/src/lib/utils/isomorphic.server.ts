import { createIsomorphicStore } from "next-isomorphic/server";

export const appStore = createIsomorphicStore("aiChatbot", {
  isSidebarOpen: true as boolean,
  isDark: true as boolean,
});

export type AppStore = ReturnType<typeof appStore>;
