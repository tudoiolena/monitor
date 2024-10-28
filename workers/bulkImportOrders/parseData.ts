import { parseAndStoreData } from "workers/parseAndStoreData";
import db from "../../app/db.server";

export async function findCheckedTask() {
  try {
    const pendingTask = await db.bulkOperation.findFirst({
      where: { status: "GENERATION_CHECKED", inProgress: true },
    });
    return pendingTask;
  } catch (error) {
    console.error("Error finding checked task:", error);
    throw error;
  }
}

export async function processCheckedTask(task: {
  id: number;
  retryCount: number;
  maxRetries: number;
  operationUrl: string;
}) {
  try {
    const start = Date.now();
    let retryCount = task.retryCount;

    while (retryCount < task.maxRetries) {
      try {
        await parseAndStoreData(task.operationUrl);
        await db.bulkOperation.update({
          where: { id: task.id },
          data: {
            status: "DATA_PARSED",
            inProgress: true,
            updatedAt: new Date(),
          },
        });
        console.log(`Task ${task.id} status updated to DATA_PARSED.`);
        return;
      } catch (err) {
        retryCount++;
        const elapsedTime = (Date.now() - start) / 1000;
        //Wait 5 min
        if (elapsedTime >= 300) {
          await db.bulkOperation.update({
            where: { id: task.id },
            data: { retryCount },
          });
          console.log(`Retrying task ${task.id}, attempt #${retryCount}`);

          await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds before retrying
        }
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
    }
  } catch (error) {
    console.error("Error processing task:", error);
    throw error;
  }
}
