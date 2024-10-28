import { json, LoaderFunction } from "@remix-run/node";
import db from "../../../db.server";

export const getOrdersLoader: LoaderFunction = async () => {
  const orders = await db.presentationTable.findMany();
  return json({ orders });
};
