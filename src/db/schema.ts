import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

// ─── Better-auth core tables ──────────────────────────────────────────────
// Stored as auth_user / auth_session / auth_account / auth_verification to
// avoid case-insensitive collisions with the legacy NextAuth-era PascalCase
// tables (User, Account, Session, VerificationToken) which remain untouched.
// Field names match @better-auth/core getAuthTables defaults so drizzleAdapter
// resolves them once we pass the schema mapping in src/lib/auth.ts and remap
// model names via betterAuth({ user: { modelName }, ... }).

export const user = sqliteTable('auth_user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('emailVerified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
});

export const session = sqliteTable('auth_session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = sqliteTable('auth_account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: integer('accessTokenExpiresAt', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refreshTokenExpiresAt', { mode: 'timestamp' }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
});

export const verification = sqliteTable('auth_verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
});

// ─── Legacy / app profile tables (PascalCase, preserved from Prisma era) ──
// `users` is the app profile table — keeps username/bio/badges/etc. and is
// referenced by Timeline/Like/Comment/Follow. Better-auth no longer reads
// from this; it's app-owned.

export const users = sqliteTable('User', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: integer('emailVerified', { mode: 'timestamp' }),
  image: text('image'),
  username: text('username').unique(),
  birthYear: integer('birthYear'),
  bio: text('bio'),
  website: text('website'),
  completedQuests: text('completedQuests').notNull().default('[]'),
  earnedBadges: text('earnedBadges').notNull().default('[]'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const accounts = sqliteTable(
  'Account',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (table) => [
    uniqueIndex('Account_provider_providerAccountId_key').on(
      table.provider,
      table.providerAccountId
    ),
  ]
);

export const sessions = sqliteTable('Session', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  sessionToken: text('sessionToken').notNull().unique(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
});

export const verificationTokens = sqliteTable(
  'VerificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull().unique(),
    expires: integer('expires', { mode: 'timestamp' }).notNull(),
  },
  (table) => [primaryKey({ columns: [table.identifier, table.token] })]
);

export const timelines = sqliteTable(
  'Timeline',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('userId').references(() => users.id, { onDelete: 'set null' }),
    title: text('title'),
    visibility: text('visibility').notNull().default('PRIVATE'),
    slug: text('slug').unique(),
    phases: text('phases').notNull().default('[]'),
    pins: text('pins').notNull().default('[]'),
    versions: text('versions').notNull().default('[]'),
    createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
    updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  },
  (table) => [
    index('Timeline_userId_idx').on(table.userId),
    index('Timeline_slug_idx').on(table.slug),
    index('Timeline_visibility_idx').on(table.visibility),
  ]
);

export const likes = sqliteTable(
  'Like',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    timelineId: text('timelineId')
      .notNull()
      .references(() => timelines.id, { onDelete: 'cascade' }),
    createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  },
  (table) => [uniqueIndex('Like_userId_timelineId_key').on(table.userId, table.timelineId)]
);

export const comments = sqliteTable(
  'Comment',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    timelineId: text('timelineId')
      .notNull()
      .references(() => timelines.id, { onDelete: 'cascade' }),
    body: text('body').notNull(),
    createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  },
  (table) => [
    index('Comment_userId_idx').on(table.userId),
    index('Comment_timelineId_idx').on(table.timelineId),
  ]
);

export const follows = sqliteTable(
  'Follow',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    followerId: text('followerId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    followingId: text('followingId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  },
  (table) => [
    uniqueIndex('Follow_followerId_followingId_key').on(table.followerId, table.followingId),
  ]
);

export const bucketListItems = sqliteTable(
  'BucketListItem',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    category: text('category'),
    status: text('status').notNull().default('planned'),
    visibility: text('visibility').notNull().default('private'),
    sourceSlug: text('sourceSlug'),
    sourceItemTitle: text('sourceItemTitle'),
    targetYear: integer('targetYear'),
    completedAt: integer('completedAt', { mode: 'timestamp' }),
    createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
    updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  },
  (table) => [index('BucketListItem_userId_idx').on(table.userId)]
);

// ─── Commitments & Stamps ─────────────────────────────────────────────────
// A "commitment" is a multi-day goal to show up daily for a hobby
// (e.g. "30 days of guitar"). Each calendar day the user logs a "stamp" —
// a proof URL (YouTube video, photo, blog post) that they practiced. Stamps
// are the "stamp of your existence": evidence that you spent this day on
// something that matters. Streaks feed back into badges and the mortality
// grid on the profile.

export const commitments = sqliteTable(
  'Commitment',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    hobbyName: text('hobbyName').notNull(),
    goalDays: integer('goalDays').notNull().default(30),
    // 'active' | 'completed' | 'abandoned'
    status: text('status').notNull().default('active'),
    startDate: integer('startDate', { mode: 'timestamp' }).notNull(),
    completedAt: integer('completedAt', { mode: 'timestamp' }),
    createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
    updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  },
  (table) => [
    index('Commitment_userId_idx').on(table.userId),
    index('Commitment_status_idx').on(table.status),
  ]
);

export const stamps = sqliteTable(
  'Stamp',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    commitmentId: text('commitmentId')
      .notNull()
      .references(() => commitments.id, { onDelete: 'cascade' }),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // Calendar day in YYYY-MM-DD (user-local), enforced unique per commitment
    // so only one stamp can exist per day.
    dayDate: text('dayDate').notNull(),
    // 0-indexed day number since commitment.startDate
    dayIndex: integer('dayIndex').notNull(),
    proofUrl: text('proofUrl').notNull(),
    // 'youtube' | 'video' | 'image' | 'url' | 'text' — derived from proofUrl
    proofType: text('proofType').notNull().default('url'),
    note: text('note'),
    createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  },
  (table) => [
    uniqueIndex('Stamp_commitmentId_dayDate_key').on(table.commitmentId, table.dayDate),
    index('Stamp_commitmentId_idx').on(table.commitmentId),
    index('Stamp_userId_idx').on(table.userId),
  ]
);

// ─── Daily Ritual (from today-little-log merge) ────────────────────────────
// One daily ritual page merges habits, rituals, and journal into a single
// flow. Private by default — no visibility fields on any of these tables.

// Habit definitions — simple check-ins, no scoring.
export const habits = sqliteTable(
  'Habit',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    // 'active' | 'archived'
    status: text('status').notNull().default('active'),
    // Target frequency: 'daily' | 'weekdays' | '3x_week' | '5x_week'
    targetFrequency: text('targetFrequency').notNull().default('daily'),
    // Optional emoji icon for visual identity
    icon: text('icon'),
    createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  },
  (table) => [index('Habit_userId_idx').on(table.userId)]
);

// Daily habit check-ins — one per habit per day.
export const habitLogs = sqliteTable(
  'HabitLog',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    habitId: text('habitId')
      .notNull()
      .references(() => habits.id, { onDelete: 'cascade' }),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // Calendar day in YYYY-MM-DD (user-local)
    dayDate: text('dayDate').notNull(),
    completed: integer('completed', { mode: 'boolean' }).notNull().default(true),
    createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  },
  (table) => [
    uniqueIndex('HabitLog_habitId_dayDate_key').on(table.habitId, table.dayDate),
    index('HabitLog_userId_idx').on(table.userId),
  ]
);

// Journal entries — one per day, linked to the daily ritual.
export const journalEntries = sqliteTable(
  'JournalEntry',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // Calendar day in YYYY-MM-DD (user-local)
    dayDate: text('dayDate').notNull(),
    // AM reflection (morning prompt response)
    amEntry: text('amEntry'),
    // PM reflection (evening prompt response — compulsory)
    pmEntry: text('pmEntry'),
    createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
    updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  },
  (table) => [
    uniqueIndex('JournalEntry_userId_dayDate_key').on(table.userId, table.dayDate),
    index('JournalEntry_userId_idx').on(table.userId),
  ]
);

// Daily ritual check-in state — tracks whether AM/PM ritual was completed.
export const dailyCheckins = sqliteTable(
  'DailyCheckin',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    // Calendar day in YYYY-MM-DD (user-local)
    dayDate: text('dayDate').notNull(),
    amCompleted: integer('amCompleted', { mode: 'boolean' }).notNull().default(false),
    pmCompleted: integer('pmCompleted', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
    updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  },
  (table) => [uniqueIndex('DailyCheckin_userId_dayDate_key').on(table.userId, table.dayDate)]
);

// Simple cuid-like ID generator using nanoid pattern
function createId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = 'c'; // cuid-style prefix
  for (let i = 0; i < 24; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}
