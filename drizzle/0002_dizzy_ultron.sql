PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_JournalEntry` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`dayDate` text NOT NULL,
	`amEntry` text,
	`pmEntry` text,
	`timelineId` text,
	`commitmentId` text,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`timelineId`) REFERENCES `Timeline`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`commitmentId`) REFERENCES `Commitment`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "JournalEntry_single_context_check" CHECK("timelineId" IS NULL OR "commitmentId" IS NULL)
);
--> statement-breakpoint
INSERT INTO `__new_JournalEntry`("id", "userId", "dayDate", "amEntry", "pmEntry", "timelineId", "commitmentId", "createdAt", "updatedAt") SELECT "id", "userId", "dayDate", "amEntry", "pmEntry", NULL, NULL, "createdAt", "updatedAt" FROM `JournalEntry`;--> statement-breakpoint
DROP TABLE `JournalEntry`;--> statement-breakpoint
ALTER TABLE `__new_JournalEntry` RENAME TO `JournalEntry`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `JournalEntry_userId_dayDate_key` ON `JournalEntry` (`userId`,`dayDate`);--> statement-breakpoint
CREATE INDEX `JournalEntry_userId_idx` ON `JournalEntry` (`userId`);--> statement-breakpoint
CREATE INDEX `JournalEntry_timelineId_idx` ON `JournalEntry` (`timelineId`);--> statement-breakpoint
CREATE INDEX `JournalEntry_commitmentId_idx` ON `JournalEntry` (`commitmentId`);
