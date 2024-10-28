import { bulkOrderExport } from "workers/bulkOrderExport";
import db from "../../app/db.server";
import shopify from "app/shopify.server";

export async function findWaitGenerationTask() {
  try {
    const pendingTask = await db.bulkOperation.findFirst({
      where: { status: "WAIT_GENERATION", inProgress: true },
    });
    return pendingTask;
  } catch (error) {
    console.error("Error finding task waititng for generation:", error);
    throw error;
  }
}

export async function processWaitingTask(task: {
  id: number;
  retryCount: number;
  maxRetries: number;
  shop: string;
}) {
  try {
    const start = Date.now();
    let retryCount = task.retryCount;
    const { admin } = await shopify.unauthenticated.admin(task.shop);

    while (retryCount < task.maxRetries) {
      try {
        const bulkOperation = await bulkOrderExport(admin.graphql);

        const operationId =
          bulkOperation?.data.bulkOperationRunQuery?.bulkOperation?.id;

        if (!operationId) {
          throw new Error(
            "Failed to start bulk operation, no operation ID received.",
          );
        }

        await db.bulkOperation.update({
          where: { id: task.id },
          data: {
            status: "START_GENERATION",
            operationId,
            updatedAt: new Date(),
          },
        });

        console.log(`Task ${task.id} status updated to START_GENERATION.`);
        console.log(
          `Bulk operation started for shop ${task.shop}, operation ID: ${operationId}`,
        );
        return;
      } catch (err) {
        retryCount++;
        const elapsedTime = (Date.now() - start) / 1000;

        if (elapsedTime >= 300) {
          //Wait 5 min
          throw new Error(`Task ${task.id} exceeded the 5-minute time limit.`);
        }

        await db.bulkOperation.update({
          where: { id: task.id },
          data: { retryCount },
        });
        console.log(`Retrying task ${task.id}, attempt #${retryCount}`);

        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds before retrying
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
