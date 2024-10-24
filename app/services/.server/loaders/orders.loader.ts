import { json, LoaderFunction } from "@remix-run/node";
import db from "../../../db.server";

export const getOrdersLoader: LoaderFunction = async () => {
  try {
    // Use findMany to get all records
    const orders = await db.presentationTable.findMany();
    console.log("Fetched orders:", orders);
    return json({ orders });
  } catch (err) {
    console.log("Error fetching orders:", err);
    return json({ orders: [] }, { status: 500 }); // Return an empty array on error
  }
};
