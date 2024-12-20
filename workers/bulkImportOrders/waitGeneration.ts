//runner function - find tasks for execution with special status
// process - pass a task, change status in db and finish

import db from "../../app/db.server";

export async function findPendingTask() {
  try {
    const pendingTask = await db.bulkOperation.findFirst({
      where: { status: "PENDING", inProgress: false },
    });
    return pendingTask;
  } catch (error) {
    console.error("Error finding pending task:", error);
    throw error;
  }
}

export async function processPendingTask(task: {
  id: number;
  retryCount: number;
  maxRetries: number;
}) {
  try {
    const start = Date.now();
    let retryCount = task.retryCount;

    while (retryCount < task.maxRetries) {
      try {
        await db.bulkOperation.update({
          where: { id: task.id },
          data: {
            status: "WAIT_GENERATION",
            inProgress: true,
            updatedAt: new Date(),
          },
        });
        console.log(`Task ${task.id} status updated to WAIT_GENERATION.`);
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
