ALTER TABLE `Habit` ADD `commitmentId` text REFERENCES Commitment(id) ON DELETE SET NULL;--> statement-breakpoint
CREATE INDEX `Habit_commitmentId_idx` ON `Habit` (`commitmentId`);
