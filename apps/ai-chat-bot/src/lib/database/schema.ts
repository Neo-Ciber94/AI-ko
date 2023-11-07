import { relations } from "drizzle-orm";
import {
  sqliteTable,
  text,
  blob,
  integer,
  customType,
} from "drizzle-orm/sqlite-core";
import { type OpenAIModel } from "../common/constants";

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

const modelColumn = customType<{ data: OpenAIModel }>({
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

const roleColumn = customType<{ data: "user" | "assistant" }>({
  dataType() {
    return "text";
  },
});

export const conversationMessages = sqliteTable("conversation_message", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  role: roleColumn("role").notNull(),
  createdAt: integer("created_at")
    .notNull()
    .$defaultFn(() => Date.now()),
});

export const messageTextContents = sqliteTable("message_text_content", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  text: text("text").notNull(),
  conversationMessageId: text("conversation_message_id")
    .notNull()
    .references(() => conversationMessages.id, { onDelete: "cascade" }),
  createdAt: integer("created_at")
    .notNull()
    .$defaultFn(() => Date.now()),
});

export const messageImageContents = sqliteTable("message_image_content", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  imagePrompt: text("image_prompt").notNull(),
  imageUrl: text("image_url").notNull(),
  conversationMessageId: text("conversation_message_id")
    .notNull()
    .references(() => conversationMessages.id, { onDelete: "cascade" }),
  createdAt: integer("created_at")
    .notNull()
    .$defaultFn(() => Date.now()),
});

export const conversationRelations = relations(conversations, ({ many }) => ({
  conversationMessages: many(conversationMessages),
}));

export const conversationMessagesRelations = relations(
  conversationMessages,
  ({ one, many }) => ({
    conversation: one(conversations, {
      fields: [conversationMessages.conversationId],
      references: [conversations.id],
    }),
    imageContents: many(messageImageContents),
    textContents: many(messageTextContents),
  }),
);
