" use client";

import { createIsomorphicClient } from "@/components/isomorphic/client";
import { type AppStore } from "./isomorphic.server";

export const isomorphicClient = createIsomorphicClient<AppStore>({
  onChange(newState) {
    if (newState.isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  },
});
