-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'COMPLETED');

-- AlterTable
ALTER TABLE "application" ADD COLUMN     "completedDate" TIMESTAMP(3),
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "operator" TEXT,
ADD COLUMN     "scheduledDate" TIMESTAMP(3),
ADD COLUMN     "status" "ApplicationStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "weatherConditions" TEXT;

-- CreateIndex
CREATE INDEX "application_userId_status_idx" ON "application"("userId", "status");
