-- CreateTable
CREATE TABLE "application" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nozzleId" TEXT NOT NULL,
    "sprayVolumeLHa" DOUBLE PRECISION NOT NULL,
    "nozzleSpacingM" DOUBLE PRECISION NOT NULL,
    "tankSizeL" DOUBLE PRECISION NOT NULL,
    "speedKmH" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_area" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sizeHa" DOUBLE PRECISION NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "application_area_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "application_userId_idx" ON "application"("userId");

-- CreateIndex
CREATE INDEX "application_userId_createdAt_idx" ON "application"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "application_area_applicationId_idx" ON "application_area"("applicationId");

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_area" ADD CONSTRAINT "application_area_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
