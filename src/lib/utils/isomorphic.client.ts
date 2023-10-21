" use client";

import { createIsomorphicClient } from "@/components/isomorphic/client";
import { type Store } from "./isomorphic.server";

export const isomorphicClient = createIsomorphicClient<Store>();
