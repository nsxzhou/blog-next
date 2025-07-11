/*
  Warnings:

  - You are about to alter the column `type` on the `notifications` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(4))`.
  - You are about to drop the column `category_id` on the `posts` table. All the data in the column will be lost.
  - You are about to drop the column `comment_count` on the `posts` table. All the data in the column will be lost.
  - You are about to alter the column `value` on the `settings` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `comments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `email_queue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `search_history` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_follows` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `page_url` to the `analytics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `session_id` to the `analytics` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `media` table without a default value. This is not possible if the table is not empty.
  - Made the column `title` on table `notifications` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `comments` DROP FOREIGN KEY `comments_author_id_fkey`;

-- DropForeignKey
ALTER TABLE `comments` DROP FOREIGN KEY `comments_parent_id_fkey`;

-- DropForeignKey
ALTER TABLE `comments` DROP FOREIGN KEY `comments_post_id_fkey`;

-- DropForeignKey
ALTER TABLE `posts` DROP FOREIGN KEY `posts_category_id_fkey`;

-- DropForeignKey
ALTER TABLE `search_history` DROP FOREIGN KEY `search_history_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `user_follows` DROP FOREIGN KEY `user_follows_follower_id_fkey`;

-- DropForeignKey
ALTER TABLE `user_follows` DROP FOREIGN KEY `user_follows_following_id_fkey`;

-- DropIndex
DROP INDEX `posts_category_id_fkey` ON `posts`;

-- AlterTable
ALTER TABLE `analytics` ADD COLUMN `browser` VARCHAR(191) NULL,
    ADD COLUMN `city` VARCHAR(191) NULL,
    ADD COLUMN `country` VARCHAR(191) NULL,
    ADD COLUMN `device` VARCHAR(191) NULL,
    ADD COLUMN `duration` INTEGER NULL,
    ADD COLUMN `os` VARCHAR(191) NULL,
    ADD COLUMN `page_url` VARCHAR(191) NOT NULL,
    ADD COLUMN `session_id` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `media` ADD COLUMN `cdn_url` VARCHAR(191) NULL,
    ADD COLUMN `folder` VARCHAR(191) NULL,
    ADD COLUMN `thumbnail_url` VARCHAR(191) NULL,
    ADD COLUMN `type` ENUM('IMAGE', 'VIDEO', 'DOCUMENT', 'OTHER') NOT NULL;

-- AlterTable
ALTER TABLE `notifications` ADD COLUMN `read_at` DATETIME(3) NULL,
    MODIFY `user_id` VARCHAR(191) NULL,
    MODIFY `type` ENUM('SYSTEM', 'POST_LIKE', 'NEW_POST', 'MAINTENANCE') NOT NULL,
    MODIFY `title` VARCHAR(191) NOT NULL,
    MODIFY `content` TEXT NULL;

-- AlterTable
ALTER TABLE `posts` DROP COLUMN `category_id`,
    DROP COLUMN `comment_count`,
    ADD COLUMN `word_count` INTEGER NOT NULL DEFAULT 0,
    MODIFY `excerpt` TEXT NULL;

-- AlterTable
ALTER TABLE `settings` MODIFY `value` JSON NULL,
    MODIFY `type` VARCHAR(191) NOT NULL DEFAULT 'json';

-- AlterTable
ALTER TABLE `tags` ADD COLUMN `color` VARCHAR(191) NULL,
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `icon` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `categories`;

-- DropTable
DROP TABLE `comments`;

-- DropTable
DROP TABLE `email_queue`;

-- DropTable
DROP TABLE `search_history`;

-- DropTable
DROP TABLE `user_follows`;

-- CreateTable
CREATE TABLE `projects` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `content` TEXT NOT NULL,
    `cover_image` VARCHAR(191) NULL,
    `demo_url` VARCHAR(191) NULL,
    `github_url` VARCHAR(191) NULL,
    `tech_stack` JSON NOT NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `published_at` DATETIME(3) NULL,

    UNIQUE INDEX `projects_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `analytics_session_id_idx` ON `analytics`(`session_id`);

-- CreateIndex
CREATE INDEX `analytics_created_at_idx` ON `analytics`(`created_at`);

-- CreateIndex
CREATE INDEX `notifications_user_id_is_read_idx` ON `notifications`(`user_id`, `is_read`);

-- CreateIndex
CREATE INDEX `notifications_created_at_idx` ON `notifications`(`created_at`);
