import type { Config } from "drizzle-kit";

export default {
  schema: "./src/lib/database/schema.ts",
  driver: "better-sqlite",
  out: "./drizzle",
  dbCredentials: {
    url: "./data/my_data.db",
  },
} satisfies Config;
