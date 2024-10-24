import { LoaderFunction, json } from "@remix-run/node";
import db from "../../../db.server";

export const statusLoader: LoaderFunction = async () => {
  const bulkOperation = await db.bulkOperation.findFirst({
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!bulkOperation) {
    throw new Response("No bulk operation found");
  }

  return json({ status: bulkOperation.status });
};
