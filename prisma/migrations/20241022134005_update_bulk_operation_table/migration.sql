/*
  Warnings:

  - The primary key for the `BulkOperation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `BulkOperation` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - Added the required column `error` to the `BulkOperation` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BulkOperation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "operationId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "error" TEXT NOT NULL,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "inProgress" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_BulkOperation" ("createdAt", "id", "operationId", "status", "updatedAt") SELECT "createdAt", "id", "operationId", "status", "updatedAt" FROM "BulkOperation";
DROP TABLE "BulkOperation";
ALTER TABLE "new_BulkOperation" RENAME TO "BulkOperation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
