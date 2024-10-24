import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";

export async function getOrdersLoader({ request }: LoaderFunctionArgs) {
  console.log("Before fetching orders");
  const orders = await prisma.order.findMany();
  console.log("Fetched orders: ", orders);
  return json({ orders });
}
