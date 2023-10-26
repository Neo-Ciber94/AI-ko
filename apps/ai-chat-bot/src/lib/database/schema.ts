import {
  sqliteTable,
  text,
  blob,
  integer,
  customType,
} from "drizzle-orm/sqlite-core";

const booleanType = customType<{
  data: boolean;
  driverData: number;
}>({
  dataType() {
    return "integer";
  },
  toDriver(value) {
    return value ? 1 : 0;
  },
  fromDriver(value) {
    return value === 1;
  },
});

export const users = sqliteTable("user", {
  id: text("id").primaryKey(),
  username: text("username"),
  isAuthorized: booleanType("is_authorized").default(false),
});

export const userSessions = sqliteTable("user_session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  activeExpires: blob("active_expires", {
    mode: "bigint",
  }).notNull(),
  idleExpires: blob("idle_expires", {
    mode: "bigint",
  }).notNull(),
});

export const userKeys = sqliteTable("user_key", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  hashedPassword: text("hashed_password"),
});

const modelColumn = customType<{ data: "gpt-3.5-turbo" | "gpt-4" }>({
  dataType() {
    return "text";
  },
});

export const conversations = sqliteTable("conversation", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  model: modelColumn("model").notNull(),
  title: text("title").notNull(),
  createdAt: integer("created_at")
    .notNull()
    .$defaultFn(() => Date.now()),
});

const roleColumn = customType<{ data: "user" | "system" }>({
  dataType() {
    return "text";
  },
});

export const conversationMessages = sqliteTable("conversation_message", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  conversationId: text("conversation_id").notNull(),
  role: roleColumn("role").notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at")
    .notNull()
    .$defaultFn(() => Date.now()),
});
