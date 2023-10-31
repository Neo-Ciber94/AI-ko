CREATE TABLE `conversation_message` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`role` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversation`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `conversation` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`model` text NOT NULL,
	`title` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `message_content` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`data` text NOT NULL,
	`conversation_message_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`conversation_message_id`) REFERENCES `conversation_message`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_key` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`hashed_password` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`active_expires` blob NOT NULL,
	`idle_expires` blob NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text,
	`is_authorized` integer DEFAULT false
);
