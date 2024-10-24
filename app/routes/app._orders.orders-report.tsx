import { useLoaderData } from "@remix-run/react";
import { getOrdersLoader } from "app/services/.server/loaders/orders.loader";

export const loader = getOrdersLoader;

export default function OrderList() {
  const { orders } = useLoaderData<typeof loader>();
  console.log("orders!!!!!!!", orders);
  return (
    <div>
      {orders.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer Name</th>
              <th>Customer Email</th>
              <th>Order Count</th>
              <th>Return Count</th>
              <th>Return Percentage</th>
              <th>Return Cost</th>
            </tr>
          </thead>
          {/* <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customerName}</td>
                <td>{order.customerEmail}</td>
              </tr>
            ))}
          </tbody> */}
        </table>
      ) : (
        <p>No orders found.</p>
      )}
    </div>
  );
}
