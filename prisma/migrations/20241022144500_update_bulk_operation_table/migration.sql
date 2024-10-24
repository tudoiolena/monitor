/*
  Warnings:

  - A unique constraint covering the columns `[shop]` on the table `BulkOperation` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BulkOperation_shop_key" ON "BulkOperation"("shop");
