CREATE TABLE `report_rate_limits` (
	`fingerprint` text PRIMARY KEY NOT NULL,
	`window_start` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE `projects` ADD `repository_url` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `verification_status` text DEFAULT 'unverified' NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `last_checked_at` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `last_check_status` text DEFAULT 'unchecked' NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `consecutive_check_failures` integer DEFAULT 0 NOT NULL;