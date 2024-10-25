-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PresentationTable" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "orderCount" INTEGER NOT NULL,
    "returnCount" INTEGER NOT NULL,
    "returnPercetage" TEXT NOT NULL,
    "costOfReturns" TEXT NOT NULL
);
INSERT INTO "new_PresentationTable" ("costOfReturns", "customerEmail", "customerName", "id", "orderCount", "returnCount", "returnPercetage") SELECT "costOfReturns", "customerEmail", "customerName", "id", "orderCount", "returnCount", "returnPercetage" FROM "PresentationTable";
DROP TABLE "PresentationTable";
ALTER TABLE "new_PresentationTable" RENAME TO "PresentationTable";
CREATE UNIQUE INDEX "PresentationTable_customerEmail_key" ON "PresentationTable"("customerEmail");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
