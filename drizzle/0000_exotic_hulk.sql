CREATE TABLE `creators` (
	`id` text PRIMARY KEY NOT NULL,
	`github_id` text NOT NULL,
	`github_handle` text NOT NULL,
	`display_name` text NOT NULL,
	`avatar_url` text NOT NULL,
	`github_profile_url` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `creators_github_id_idx` ON `creators` (`github_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `creators_github_handle_idx` ON `creators` (`github_handle`);--> statement-breakpoint
CREATE TABLE `oauth_states` (
	`state_hash` text PRIMARY KEY NOT NULL,
	`return_to` text NOT NULL,
	`created_at` text NOT NULL,
	`expires_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `project_reports` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`reason` text NOT NULL,
	`details` text,
	`status` text DEFAULT 'open' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `project_reports_project_idx` ON `project_reports` (`project_id`,`status`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`creator_id` text NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`short_description` text NOT NULL,
	`live_url` text NOT NULL,
	`moderation_status` text DEFAULT 'submitted' NOT NULL,
	`thumbnail_status` text DEFAULT 'pending' NOT NULL,
	`thumbnail_storage_key` text,
	`thumbnail_error` text,
	`moderation_note` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`published_at` text,
	FOREIGN KEY (`creator_id`) REFERENCES `creators`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `projects_slug_idx` ON `projects` (`slug`);--> statement-breakpoint
CREATE INDEX `projects_creator_idx` ON `projects` (`creator_id`);--> statement-breakpoint
CREATE INDEX `projects_status_published_idx` ON `projects` (`moderation_status`,`published_at`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`creator_id` text NOT NULL,
	`created_at` text NOT NULL,
	`expires_at` text NOT NULL,
	FOREIGN KEY (`creator_id`) REFERENCES `creators`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sessions_creator_idx` ON `sessions` (`creator_id`);