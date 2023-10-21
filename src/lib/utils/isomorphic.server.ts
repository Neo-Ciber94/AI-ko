import { createIsomorphicStore } from "@/components/isomorphic/server";

export const appStore = createIsomorphicStore("aiChatbot", {
  sidebarOpen: true as boolean,
});

export type AppStore = ReturnType<typeof appStore>;
