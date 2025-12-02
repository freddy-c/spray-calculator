-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('SOLUBLE', 'LIQUID');

-- CreateTable
CREATE TABLE "product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ProductType" NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_product" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "ratePerHa" DOUBLE PRECISION NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "application_product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_isPublic_idx" ON "product"("isPublic");

-- CreateIndex
CREATE INDEX "product_userId_idx" ON "product"("userId");

-- CreateIndex
CREATE INDEX "product_isPublic_userId_idx" ON "product"("isPublic", "userId");

-- CreateIndex
CREATE INDEX "application_product_applicationId_idx" ON "application_product"("applicationId");

-- CreateIndex
CREATE INDEX "application_product_productId_idx" ON "application_product"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "application_product_applicationId_productId_key" ON "application_product"("applicationId", "productId");

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_product" ADD CONSTRAINT "application_product_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_product" ADD CONSTRAINT "application_product_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
