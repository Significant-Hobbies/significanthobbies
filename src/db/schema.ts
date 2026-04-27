import { sqliteTable, text, integer, uniqueIndex, index, primaryKey } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ─── Better-auth core tables ──────────────────────────────────────────────
// Stored as auth_user / auth_session / auth_account / auth_verification to
// avoid case-insensitive collisions with the legacy NextAuth-era PascalCase
// tables (User, Account, Session, VerificationToken) which remain untouched.
// Field names match @better-auth/core getAuthTables defaults so drizzleAdapter
// resolves them once we pass the schema mapping in src/lib/auth.ts and remap
// model names via betterAuth({ user: { modelName }, ... }).

export const user = sqliteTable("auth_user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "boolean" })
    .notNull()
    .default(false),
  image: text("image"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const session = sqliteTable("auth_session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("auth_account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: integer("accessTokenExpiresAt", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refreshTokenExpiresAt", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("auth_verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

// ─── Legacy / app profile tables (PascalCase, preserved from Prisma era) ──
// `users` is the app profile table — keeps username/bio/badges/etc. and is
// referenced by Timeline/Like/Comment/Follow. Better-auth no longer reads
// from this; it's app-owned.

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
