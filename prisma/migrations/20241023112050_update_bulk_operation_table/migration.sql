/*
  Warnings:

  - You are about to drop the column `graphql` on the `BulkOperation` table. All the data in the column will be lost.

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
    "urlToFile" TEXT NOT NULL,
    "inProgress" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "sessionData" TEXT NOT NULL DEFAULT ''
);
INSERT INTO "new_BulkOperation" ("createdAt", "error", "id", "inProgress", "maxRetries", "operationId", "retryCount", "shop", "status", "updatedAt", "urlToFile") SELECT "createdAt", "error", "id", "inProgress", "maxRetries", "operationId", "retryCount", "shop", "status", "updatedAt", "urlToFile" FROM "BulkOperation";
DROP TABLE "BulkOperation";
ALTER TABLE "new_BulkOperation" RENAME TO "BulkOperation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
