CREATE TABLE `TrajectoryContract` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`previousContractId` text,
	`constraintsText` text NOT NULL,
	`intentText` text NOT NULL,
	`decisionPolicyText` text NOT NULL,
	`feedbackLoopText` text NOT NULL,
	`cadence` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`openedAt` integer DEFAULT (unixepoch()) NOT NULL,
	`closedAt` integer,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `TrajectoryContract_userId_idx` ON `TrajectoryContract` (`userId`);--> statement-breakpoint
CREATE UNIQUE INDEX `TrajectoryContract_one_active_per_user_idx` ON `TrajectoryContract` (`userId`) WHERE "TrajectoryContract"."status" = 'active';--> statement-breakpoint
CREATE TABLE `TrajectoryReview` (
	`id` text PRIMARY KEY NOT NULL,
	`contractId` text NOT NULL,
	`userId` text NOT NULL,
	`signalText` text NOT NULL,
	`decision` text NOT NULL,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`contractId`) REFERENCES `TrajectoryContract`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `TrajectoryReview_contractId_idx` ON `TrajectoryReview` (`contractId`);--> statement-breakpoint
CREATE INDEX `TrajectoryReview_userId_idx` ON `TrajectoryReview` (`userId`);