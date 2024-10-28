/*
  Warnings:

  - You are about to alter the column `totalCost` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal`.
  - You are about to alter the column `totalRefunded` on the `Refund` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "totalCost" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL
);
INSERT INTO "new_Order" ("currency", "customerEmail", "customerName", "id", "totalCost") SELECT "currency", "customerEmail", "customerName", "id", "totalCost" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE TABLE "new_Refund" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "refundId" TEXT NOT NULL,
    "totalRefunded" DECIMAL NOT NULL,
    "refundCurrency" TEXT NOT NULL,
    CONSTRAINT "Refund_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Refund" ("id", "orderId", "refundCurrency", "refundId", "totalRefunded") SELECT "id", "orderId", "refundCurrency", "refundId", "totalRefunded" FROM "Refund";
DROP TABLE "Refund";
ALTER TABLE "new_Refund" RENAME TO "Refund";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
