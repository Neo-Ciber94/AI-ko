import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

export const sqliteDatabase = new Database("./data/my_data.db");

export const db = drizzle(sqliteDatabase, { schema });
