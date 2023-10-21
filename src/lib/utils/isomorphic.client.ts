" use client";

import { createIsomorphicClient } from "@/components/isomorphic/client";
import { type AppStore } from "./isomorphic.server";

export const isomorphicClient = createIsomorphicClient<AppStore>();
