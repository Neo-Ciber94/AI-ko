" use client";

import { createIsomorphicClient } from "@/components/isomorphic/client";
import { type AppStore } from "./isomorphic.server";

export const isomorphicClient = createIsomorphicClient<AppStore>({
  onChange({ isDark }) {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  },
});
