-- CreateTable
CREATE TABLE "Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerName" TEXT NOT NULL,
    "orderCount" INTEGER NOT NULL DEFAULT 0,
    "returnCount" INTEGER NOT NULL DEFAULT 0,
    "returnPercentage" INTEGER NOT NULL,
    "returnCost" INTEGER NOT NULL,
    "customerEmail" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_customerEmail_key" ON "Order"("customerEmail");
