// import fsPromises from "fs/promises";
// import csvParser from "csv-parser";
// import { bulkOrderExport } from "./bulkOrderExport";
// // import type { GraphqlClient } from "./bulkOrderExport";
// import { checkBulkOperationStatus } from "./checkBulkOperation";
// import db from "../db.server";

// export async function processBulkOperation(graphql: GraphqlClient) {
//   const bulkOperation = await bulkOrderExport(graphql);
//   const operationId = bulkOperation.id;

//   let operationStatus = await checkBulkOperationStatus(graphql, operationId);

//   while (operationStatus.status !== "COMPLETED") {
//     console.log(
//       `Waiting for bulk operation to complete... Status: ${operationStatus.status}`,
//     );
//     await new Promise((resolve) => setTimeout(resolve, 10000));
//     operationStatus = await checkBulkOperationStatus(graphql, operationId);
//   }

//   if (operationStatus.url) {
//     const response = await fetch(operationStatus.url);
//     const fileBuffer = await response.arrayBuffer();
//     await fsPromises.writeFile("bulk_orders.csv", Buffer.from(fileBuffer));

//     const fileContent = await fsPromises.readFile("bulk_orders.csv");
//     const results = [];
//     await new Promise((resolve, reject) => {
//       csvParser()
//         .on("data", (data) => results.push(data))
//         .on("end", resolve)
//         .on("error", reject)
//         .write(fileContent);
//     });

//     for (const order of results) {
//       //TODO: Rewrite with real data
//       const totalOrders = 1;
//       const totalReturns = 2;
//       const returnPercentage = 3;

//       await db.order.create({
//         data: {
//           id: order.id,
//           customerEmail: order.customer_email,
//           customerName: order.customer_displayName,
//           returnPercentage: returnPercentage,
//           returnCost: order.total_returned,
//           returnCount: totalReturns,
//           orderCount: totalOrders,
//         },
//       });
//     }
//     console.log("Orders and returns have been successfully saved.");
//   } else {
//     throw new Error("No URL found for bulk operation results.");
//   }
// }
