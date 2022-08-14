ALTER TABLE `Users`
ADD
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `status`,
ADD
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER `created_at`,
ADD
    `deleted_at` TIMESTAMP NULL DEFAULT NULL AFTER `updated_at`;