import { createIsomorphicStore } from "@/components/isomorphic/server";

export const store = createIsomorphicStore("aiChatbot", {
  sidebarOpen: true as boolean,
});

export type Store = typeof store;