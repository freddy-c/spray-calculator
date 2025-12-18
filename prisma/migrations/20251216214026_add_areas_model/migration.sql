/*
  Warnings:

  - You are about to drop the column `label` on the `application_area` table. All the data in the column will be lost.
  - You are about to drop the column `sizeHa` on the `application_area` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `application_area` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[applicationId,areaId]` on the table `application_area` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `areaId` to the `application_area` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AreaType" AS ENUM ('GREEN', 'TEE', 'FAIRWAY', 'ROUGH', 'FIRST_CUT', 'APRON', 'COLLAR', 'PATH', 'OTHER');

-- AlterTable
ALTER TABLE "application_area" DROP COLUMN "label",
DROP COLUMN "sizeHa",
DROP COLUMN "type",
ADD COLUMN     "areaId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "area" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AreaType" NOT NULL,
    "sizeHa" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "area_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "area_userId_idx" ON "area"("userId");

-- CreateIndex
CREATE INDEX "application_area_areaId_idx" ON "application_area"("areaId");

-- CreateIndex
CREATE UNIQUE INDEX "application_area_applicationId_areaId_key" ON "application_area"("applicationId", "areaId");

-- AddForeignKey
ALTER TABLE "application_area" ADD CONSTRAINT "application_area_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "area" ADD CONSTRAINT "area_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
