import db from "../app/db.server";
import shopify from "app/shopify.server";
import { bulkOrderExport } from "./bulkOrderExport";
import cron from "node-cron";
import { checkBulkOperationStatus } from "./checkBulkOperation";
import { parseAndStoreData } from "./parseAndStoreData";

export async function exportOrders(id: number, shop: string) {
  try {
    const { admin } = await shopify.unauthenticated.admin(shop);

    const bulkOperation = await bulkOrderExport(admin.graphql);

    const operationId =
      bulkOperation?.data.bulkOperationRunQuery?.bulkOperation?.id;

    if (!operationId) {
      throw new Error(
        "Failed to start bulk operation, no operation ID received.",
      );
    }

    await db.bulkOperation.update({
      where: { id },
      data: {
        status: "IN_PROGRESS",
        operationId,
        inProgress: true,
        updatedAt: new Date(),
      },
    });

    console.log(
      `Bulk operation started for shop ${shop}, operation ID: ${operationId}`,
    );

    let isComplete = false;
    while (!isComplete) {
      const operationStatusResponse = await checkBulkOperationStatus(
        admin.graphql,
        operationId,
      );
      const operationStatus = operationStatusResponse.data.node.status;
      const operationUrl = operationStatusResponse.data.node.url;

      if (operationStatus === "COMPLETED") {
        await db.bulkOperation.update({
          where: { id },
          data: {
            status: "COMPLETED",
            urlToFile: operationUrl,
            updatedAt: new Date(),
            inProgress: false,
          },
        });
        console.log(
          `Bulk operation completed for shop ${shop}. Download URL: ${operationUrl}`,
        );

        if (operationUrl) {
          await parseAndStoreData(operationUrl);
        }

        isComplete = true;
      } else if (operationStatus === "FAILED") {
        await db.bulkOperation.update({
          where: { id },
          data: {
            status: "FAILED",
            error: operationStatus.errorCode || "Unknown error",
            updatedAt: new Date(),
            inProgress: false,
          },
        });
        console.error(
          `Bulk operation failed for shop ${shop}. Error: ${operationStatusResponse.data.node.errorCode}`,
        );
        isComplete = true;
      } else {
        console.log(`Bulk operation for shop ${shop} is still in progress...`);
        await new Promise((resolve) => setTimeout(resolve, 10000));
      }
    }
  } catch (error) {
    console.error(`Error processing export orders for shop ${shop}:`, error);

    await db.bulkOperation.update({
      where: { id },
      data: {
        status: "FAILED",
        error: error.message,
        updatedAt: new Date(),
        inProgress: false,
      },
    });
  }
}

cron.schedule("*/1 * * * *", async () => {
  console.log("Checking the queue for pending tasks...");
  const pendingTask = await db.bulkOperation.findFirst({
    where: { status: "PENDING", inProgress: false },
  });
  if (pendingTask) {
    await db.bulkOperation.update({
      where: { id: pendingTask.id },
      data: {
        inProgress: true,
        updatedAt: new Date(),
      },
    });

    await exportOrders(pendingTask.id, pendingTask.shop);
  }
});
