ALTER TABLE `conversation_message` RENAME COLUMN `sender` TO `role`;--> statement-breakpoint
ALTER TABLE `conversation_message` RENAME COLUMN `message` TO `content`;--> statement-breakpoint
ALTER TABLE conversation ADD `model` text NOT NULL;