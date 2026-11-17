CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text NOT NULL,
	`service_id` text,
	`label` text NOT NULL,
	`mime_type` text NOT NULL,
	`local_path` text NOT NULL,
	`bytes` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`service_id`) REFERENCES `service_records`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `documents_vehicle_id_idx` ON `documents` (`vehicle_id`);--> statement-breakpoint
CREATE INDEX `documents_service_id_idx` ON `documents` (`service_id`);--> statement-breakpoint
CREATE TABLE `notification_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`reminder_id` text NOT NULL,
	`planned_at_utc` text NOT NULL,
	`state` text DEFAULT 'scheduled' NOT NULL,
	FOREIGN KEY (`reminder_id`) REFERENCES `reminders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `notification_jobs_reminder_id_idx` ON `notification_jobs` (`reminder_id`);--> statement-breakpoint
CREATE TABLE `reminders` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`due_date` text,
	`target_meters` integer,
	`lead_days` integer DEFAULT 7 NOT NULL,
	`state` text DEFAULT 'upcoming' NOT NULL,
	`snoozed_until` text,
	`completed_at` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `reminders_vehicle_id_idx` ON `reminders` (`vehicle_id`);--> statement-breakpoint
CREATE TABLE `service_records` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text NOT NULL,
	`type` text NOT NULL,
	`service_on` text NOT NULL,
	`odometer_meters` integer,
	`price_minor` integer,
	`provider` text,
	`notes` text,
	`receipt_document_id` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `service_records_vehicle_id_idx` ON `service_records` (`vehicle_id`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` text PRIMARY KEY NOT NULL,
	`nickname` text NOT NULL,
	`make` text,
	`model` text,
	`year` integer,
	`plate` text,
	`photo_path` text,
	`odometer_meters` integer,
	`odometer_updated_at` text,
	`created_at` text NOT NULL
);
