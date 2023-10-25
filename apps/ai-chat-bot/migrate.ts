import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { env } from "@/lib/env";
import { createClient } from "@libsql/client";

export const tursoDbClient = createClient({
  url: env.DATABASE_URL,
  authToken: env.DATABASE_AUTH_TOKEN,
});

const db = drizzle(tursoDbClient);

// this will automatically run needed migrations on the database
migrate(db, { migrationsFolder: "./drizzle" }).catch(console.error);
