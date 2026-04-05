import { sqliteTable, text, integer, uniqueIndex, index, primaryKey } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("User", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: integer("emailVerified", { mode: "timestamp" }),
  image: text("image"),
  username: text("username").unique(),
  birthYear: integer("birthYear"),
  bio: text("bio"),
  website: text("website"),
  completedQuests: text("completedQuests").notNull().default("[]"),
  earnedBadges: text("earnedBadges").notNull().default("[]"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const accounts = sqliteTable(
  "Account",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => [
    uniqueIndex("Account_provider_providerAccountId_key").on(
      table.provider,
      table.providerAccountId,
    ),
  ],
);

export const sessions = sqliteTable("Session", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  sessionToken: text("sessionToken").notNull().unique(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

export const verificationTokens = sqliteTable(
  "VerificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull().unique(),
    expires: integer("expires", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.identifier, table.token] }),
  ],
);

export const timelines = sqliteTable(
  "Timeline",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("userId").references(() => users.id, { onDelete: "set null" }),
    title: text("title"),
    visibility: text("visibility").notNull().default("PRIVATE"),
    slug: text("slug").unique(),
    phases: text("phases").notNull().default("[]"),
    pins: text("pins").notNull().default("[]"),
    versions: text("versions").notNull().default("[]"),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
    updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  },
  (table) => [
    index("Timeline_userId_idx").on(table.userId),
    index("Timeline_slug_idx").on(table.slug),
  ],
);

export const likes = sqliteTable(
  "Like",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    timelineId: text("timelineId")
      .notNull()
      .references(() => timelines.id, { onDelete: "cascade" }),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  },
  (table) => [
    uniqueIndex("Like_userId_timelineId_key").on(table.userId, table.timelineId),
  ],
);

export const comments = sqliteTable(
  "Comment",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    timelineId: text("timelineId")
      .notNull()
      .references(() => timelines.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  },
  (table) => [
    index("Comment_userId_idx").on(table.userId),
    index("Comment_timelineId_idx").on(table.timelineId),
  ],
);

export const follows = sqliteTable(
  "Follow",
  {
    id: text("id").primaryKey().$defaultFn(() => createId()),
    followerId: text("followerId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followingId: text("followingId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  },
  (table) => [
    uniqueIndex("Follow_followerId_followingId_key").on(
      table.followerId,
      table.followingId,
    ),
  ],
);

// Simple cuid-like ID generator using nanoid pattern
function createId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "c"; // cuid-style prefix
  for (let i = 0; i < 24; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}
