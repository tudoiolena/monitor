import { findStartGenerationTask, processStartTask } from "./checkGeneration";
import { findCheckedTask, processCheckedTask } from "./parseData";
import { findWaitGenerationTask, processWaitingTask } from "./startGeneration";
import { findPendingTask, processPendingTask } from "./waitGeneration";

async function handleTask(
  findTask: () => Promise<any>,
  processTask: (task: any) => Promise<void>,
) {
  const task = await findTask();
  if (task) {
    await processTask(task);
    return true;
  }
  return false;
}

export async function main() {
  try {
    const tasks = [
      { find: findPendingTask, process: processPendingTask },
      { find: findWaitGenerationTask, process: processWaitingTask },
      { find: findStartGenerationTask, process: processStartTask },
      { find: findCheckedTask, process: processCheckedTask },
    ];

    for (const { find, process } of tasks) {
      await handleTask(find, process);
    }
  } catch (error) {
    console.error("Error in main function:", error);
  }
}
