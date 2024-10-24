/*
  Warnings:

  - Added the required column `shop` to the `BulkOperation` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BulkOperation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "operationId" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "error" TEXT NOT NULL,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "inProgress" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_BulkOperation" ("createdAt", "error", "id", "inProgress", "maxRetries", "operationId", "retryCount", "status", "updatedAt") SELECT "createdAt", "error", "id", "inProgress", "maxRetries", "operationId", "retryCount", "status", "updatedAt" FROM "BulkOperation";
DROP TABLE "BulkOperation";
ALTER TABLE "new_BulkOperation" RENAME TO "BulkOperation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
