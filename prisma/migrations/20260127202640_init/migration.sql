/*
  Warnings:

  - Made the column `description` on table `property` required. This step will fail if there are existing NULL values in that column.
  - Made the column `address` on table `property` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ubication` on table `property` required. This step will fail if there are existing NULL values in that column.
  - Made the column `city` on table `property` required. This step will fail if there are existing NULL values in that column.
  - Made the column `slug` on table `property` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "property" ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "address" SET NOT NULL,
ALTER COLUMN "ubication" SET NOT NULL,
ALTER COLUMN "city" SET NOT NULL,
ALTER COLUMN "slug" SET NOT NULL;
