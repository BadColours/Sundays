ALTER TABLE `projects` ADD `profile_status` text DEFAULT 'visible' NOT NULL;--> statement-breakpoint
UPDATE `projects` SET `profile_status` = 'hidden' WHERE `moderation_status` = 'draft';--> statement-breakpoint
CREATE INDEX `projects_creator_profile_idx` ON `projects` (`creator_id`,`profile_status`);
