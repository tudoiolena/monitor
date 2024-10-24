/*
  Warnings:

  - A unique constraint covering the columns `[customerEmail]` on the table `PresentationTable` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PresentationTable_customerEmail_key" ON "PresentationTable"("customerEmail");
