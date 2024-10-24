/*
  Warnings:

  - You are about to drop the column `refundCurrency` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `refundId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `returnId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `totalRefunded` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `costOfReturns` on the `Return` table. All the data in the column will be lost.
  - You are about to drop the column `customerEmail` on the `Return` table. All the data in the column will be lost.
  - You are about to drop the column `customerName` on the `Return` table. All the data in the column will be lost.
  - You are about to drop the column `orderCount` on the `Return` table. All the data in the column will be lost.
  - You are about to drop the column `returnCount` on the `Return` table. All the data in the column will be lost.
  - You are about to drop the column `returnPercetage` on the `Return` table. All the data in the column will be lost.
  - Added the required column `orderId` to the `Return` table without a default value. This is not possible if the table is not empty.
  - Added the required column `returnId` to the `Return` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Refund" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "refundId" TEXT NOT NULL,
    "totalRefunded" INTEGER NOT NULL,
    "refundCurrency" TEXT NOT NULL,
    CONSTRAINT "Refund_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PresentationTable" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "orderCount" INTEGER NOT NULL,
    "returnCount" INTEGER NOT NULL,
    "returnPercetage" TEXT NOT NULL,
    "costOfReturns" INTEGER NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "totalCost" INTEGER NOT NULL,
    "currency" TEXT NOT NULL
);
INSERT INTO "new_Order" ("currency", "customerEmail", "customerName", "id", "totalCost") SELECT "currency", "customerEmail", "customerName", "id", "totalCost" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE TABLE "new_Return" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "returnId" TEXT NOT NULL,
    CONSTRAINT "Return_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Return" ("id") SELECT "id" FROM "Return";
DROP TABLE "Return";
ALTER TABLE "new_Return" RENAME TO "Return";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
