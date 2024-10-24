-- CreateTable
CREATE TABLE "Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "totalCost" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "refundId" TEXT NOT NULL,
    "totalRefunded" INTEGER NOT NULL,
    "refundCurrency" TEXT NOT NULL,
    "returnId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Return" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "orderCount" INTEGER NOT NULL,
    "returnCount" INTEGER NOT NULL,
    "returnPercetage" TEXT NOT NULL,
    "costOfReturns" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "BulkOperation" (
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
    "updatedAt" DATETIME NOT NULL
);
