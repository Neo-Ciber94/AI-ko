import { env } from "../ai-chat-bot/src/lib/env";
import type { Config } from "drizzle-kit";

export default {
  schema: "./src/lib/database/schema.ts",
  driver: "libsql",
  out: "./drizzle",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
} satisfies Config;
