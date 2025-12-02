/*
  Warnings:

  - Added the required column `nozzleCount` to the `application` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- Add column with default value for existing rows, then remove the default
ALTER TABLE "application" ADD COLUMN "nozzleCount" INTEGER NOT NULL DEFAULT 4;
ALTER TABLE "application" ALTER COLUMN "nozzleCount" DROP DEFAULT;
