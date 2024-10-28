import db from "../../app/db.server";
import shopify from "app/shopify.server";
import { checkBulkOperationStatus } from "workers/checkBulkOperation";

export async function findStartGenerationTask() {
  try {
    const pendingTask = await db.bulkOperation.findFirst({
      where: { status: "START_GENERATION", inProgress: true },
    });
    return pendingTask;
  } catch (error) {
    console.error("Error finding task started for generation:", error);
    throw error;
  }
}

export async function processStartTask(task: {
  id: number;
  retryCount: number;
  maxRetries: number;
  shop: string;
  operationId: string;
}) {
  try {
    const start = Date.now();
    let retryCount = task.retryCount;
    const { admin } = await shopify.unauthenticated.admin(task.shop);

    while (retryCount < task.maxRetries) {
      try {
        const operationStatusResponse = await checkBulkOperationStatus(
          admin.graphql,
          task.operationId,
        );
        const operationStatus = operationStatusResponse.data.node.status;
        const operationUrl = operationStatusResponse.data.node.url;

        if (operationStatus === "COMPLETED") {
          await db.bulkOperation.update({
            where: { id: task.id },
            data: {
              status: "GENERATION_CHECKED",
              urlToFile: operationUrl,
              updatedAt: new Date(),
              inProgress: false,
            },
          });
          console.log(
            `Bulk operation completed for shop ${task.shop}. Download URL: ${operationUrl}`,
          );
          return;
        }
      } catch (err) {
        retryCount++;
        const elapsedTime = (Date.now() - start) / 1000;

        if (elapsedTime >= 300) {
          throw new Error(`Task ${task.id} exceeded the 5-minute time limit.`);
        }

        await db.bulkOperation.update({
          where: { id: task.id },
          data: { retryCount },
        });
        console.log(`Retrying task ${task.id}, attempt #${retryCount}`);

        await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds before retrying
      }
    }

    if (retryCount >= task.maxRetries) {
      await db.bulkOperation.update({
        where: { id: task.id },
        data: {
          error: `Failed to process a task. Max retries reached for task ${task.id}`,
          inProgress: false,
          status: "FAILED",
        },
      });
      throw new Error(`Max retries reached for task ${task.id}`);
    }
  } catch (error) {
    console.error("Error processing task:", error);
    throw error;
  }
}
