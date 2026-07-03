CREATE TABLE `auth_account` (
	`id` text PRIMARY KEY NOT NULL,
	`accountId` text NOT NULL,
	`providerId` text NOT NULL,
	`userId` text NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`idToken` text,
	`accessTokenExpiresAt` integer,
	`refreshTokenExpiresAt` integer,
	`scope` text,
	`password` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `auth_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `Account` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`providerAccountId` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Account_provider_providerAccountId_key` ON `Account` (`provider`,`providerAccountId`);--> statement-breakpoint
CREATE TABLE `BucketListItem` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`category` text,
	`status` text DEFAULT 'planned' NOT NULL,
	`visibility` text DEFAULT 'private' NOT NULL,
	`sourceSlug` text,
	`sourceItemTitle` text,
	`targetYear` integer,
	`completedAt` integer,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `BucketListItem_userId_idx` ON `BucketListItem` (`userId`);--> statement-breakpoint
CREATE TABLE `Comment` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`timelineId` text NOT NULL,
	`body` text NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`timelineId`) REFERENCES `Timeline`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `Comment_userId_idx` ON `Comment` (`userId`);--> statement-breakpoint
CREATE INDEX `Comment_timelineId_idx` ON `Comment` (`timelineId`);--> statement-breakpoint
CREATE TABLE `Commitment` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`hobbyName` text NOT NULL,
	`goalDays` integer DEFAULT 30 NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`startDate` integer NOT NULL,
	`completedAt` integer,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `Commitment_userId_idx` ON `Commitment` (`userId`);--> statement-breakpoint
CREATE INDEX `Commitment_status_idx` ON `Commitment` (`status`);--> statement-breakpoint
CREATE TABLE `DailyCheckin` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`dayDate` text NOT NULL,
	`amCompleted` integer DEFAULT false NOT NULL,
	`pmCompleted` integer DEFAULT false NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `DailyCheckin_userId_dayDate_key` ON `DailyCheckin` (`userId`,`dayDate`);--> statement-breakpoint
CREATE TABLE `Follow` (
	`id` text PRIMARY KEY NOT NULL,
	`followerId` text NOT NULL,
	`followingId` text NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`followerId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`followingId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Follow_followerId_followingId_key` ON `Follow` (`followerId`,`followingId`);--> statement-breakpoint
CREATE TABLE `HabitLog` (
	`id` text PRIMARY KEY NOT NULL,
	`habitId` text NOT NULL,
	`userId` text NOT NULL,
	`dayDate` text NOT NULL,
	`completed` integer DEFAULT true NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`habitId`) REFERENCES `Habit`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `HabitLog_habitId_dayDate_key` ON `HabitLog` (`habitId`,`dayDate`);--> statement-breakpoint
CREATE INDEX `HabitLog_userId_idx` ON `HabitLog` (`userId`);--> statement-breakpoint
CREATE TABLE `Habit` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`name` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `Habit_userId_idx` ON `Habit` (`userId`);--> statement-breakpoint
CREATE TABLE `JournalEntry` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`dayDate` text NOT NULL,
	`amEntry` text,
	`pmEntry` text,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `JournalEntry_userId_dayDate_key` ON `JournalEntry` (`userId`,`dayDate`);--> statement-breakpoint
CREATE INDEX `JournalEntry_userId_idx` ON `JournalEntry` (`userId`);--> statement-breakpoint
CREATE TABLE `Like` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`timelineId` text NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`timelineId`) REFERENCES `Timeline`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Like_userId_timelineId_key` ON `Like` (`userId`,`timelineId`);--> statement-breakpoint
CREATE TABLE `auth_session` (
	`id` text PRIMARY KEY NOT NULL,
	`expiresAt` integer NOT NULL,
	`token` text NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`ipAddress` text,
	`userAgent` text,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `auth_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_session_token_unique` ON `auth_session` (`token`);--> statement-breakpoint
CREATE TABLE `Session` (
	`id` text PRIMARY KEY NOT NULL,
	`sessionToken` text NOT NULL,
	`userId` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Session_sessionToken_unique` ON `Session` (`sessionToken`);--> statement-breakpoint
CREATE TABLE `Stamp` (
	`id` text PRIMARY KEY NOT NULL,
	`commitmentId` text NOT NULL,
	`userId` text NOT NULL,
	`dayDate` text NOT NULL,
	`dayIndex` integer NOT NULL,
	`proofUrl` text NOT NULL,
	`proofType` text DEFAULT 'url' NOT NULL,
	`note` text,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`commitmentId`) REFERENCES `Commitment`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Stamp_commitmentId_dayDate_key` ON `Stamp` (`commitmentId`,`dayDate`);--> statement-breakpoint
CREATE INDEX `Stamp_commitmentId_idx` ON `Stamp` (`commitmentId`);--> statement-breakpoint
CREATE INDEX `Stamp_userId_idx` ON `Stamp` (`userId`);--> statement-breakpoint
CREATE TABLE `Timeline` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text,
	`title` text,
	`visibility` text DEFAULT 'PRIVATE' NOT NULL,
	`slug` text,
	`phases` text DEFAULT '[]' NOT NULL,
	`pins` text DEFAULT '[]' NOT NULL,
	`versions` text DEFAULT '[]' NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Timeline_slug_unique` ON `Timeline` (`slug`);--> statement-breakpoint
CREATE INDEX `Timeline_userId_idx` ON `Timeline` (`userId`);--> statement-breakpoint
CREATE INDEX `Timeline_slug_idx` ON `Timeline` (`slug`);--> statement-breakpoint
CREATE INDEX `Timeline_visibility_idx` ON `Timeline` (`visibility`);--> statement-breakpoint
CREATE TABLE `auth_user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`emailVerified` integer DEFAULT false NOT NULL,
	`image` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_user_email_unique` ON `auth_user` (`email`);--> statement-breakpoint
CREATE TABLE `User` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text,
	`emailVerified` integer,
	`image` text,
	`username` text,
	`birthYear` integer,
	`bio` text,
	`website` text,
	`completedQuests` text DEFAULT '[]' NOT NULL,
	`earnedBadges` text DEFAULT '[]' NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `User_email_unique` ON `User` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `User_username_unique` ON `User` (`username`);--> statement-breakpoint
CREATE TABLE `auth_verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `VerificationToken` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL,
	PRIMARY KEY(`identifier`, `token`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `VerificationToken_token_unique` ON `VerificationToken` (`token`);