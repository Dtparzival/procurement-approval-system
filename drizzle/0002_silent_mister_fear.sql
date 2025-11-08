ALTER TABLE `procurement_approvals` MODIFY COLUMN `generatedContent` text;--> statement-breakpoint
ALTER TABLE `procurement_approvals` MODIFY COLUMN `title` varchar(255);--> statement-breakpoint
ALTER TABLE `procurement_approvals` ADD `status` enum('draft','completed') DEFAULT 'draft' NOT NULL;