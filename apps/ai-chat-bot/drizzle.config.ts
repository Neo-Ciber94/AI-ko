import "dotenv/config";
import { env } from "./src/lib/env.js";
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/lib/database/schema.ts",
  driver: "libsql",
  out: "./drizzle",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
} satisfies Config;
