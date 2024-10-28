import db from "../app/db.server";

type OrderRecord = {
  id: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  totalPriceSet: {
    shopMoney: {
      amount: number;
      currencyCode: string;
    };
  };
  refunds: RefundRecord[];
  __parentId?: string;
};

type RefundRecord = {
  id: string;
  totalRefundedSet: {
    shopMoney: {
      amount: number;
      currencyCode: string;
    };
  };
};

type ReturnRecord = {
  id: string;
  __parentId: string;
};

type ProcessedOrder = {
  customerName: string;
  customerEmail: string;
  totalCost: number;
  currency: string;
  refunds: ProcessedRefund[];
  returns: ProcessedReturn[];
};

type ProcessedRefund = {
  refundId: string;
  totalRefunded: number;
  refundCurrency: string;
};

type ProcessedReturn = {
  returnId: string;
};

export async function parseAndStoreData(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.text();
    const lines = data.split("\n");
    const orders: Record<string, ProcessedOrder> = {};
    const returns: ReturnRecord[] = [];

    for (const line of lines) {
      if (line.trim()) {
        try {
          const record: OrderRecord | ReturnRecord = JSON.parse(line);

          if ("__parentId" in record) {
            // This is a return record, associate it with an order using __parentId
            returns.push(record as ReturnRecord);
          } else {
            // This is an order record
            const customerName =
              `${record.customer?.firstName || ""} ${record.customer?.lastName || ""}`.trim();
            const customerEmail = record.customer?.email || "";
            const totalCost = record.totalPriceSet?.shopMoney?.amount || 0;
            const currency =
              record.totalPriceSet?.shopMoney?.currencyCode || "N/A";

            const refunds =
              record.refunds?.map((refund) => ({
                refundId: refund.id || "N/A",
                totalRefunded: refund.totalRefundedSet?.shopMoney?.amount,
                refundCurrency:
                  refund.totalRefundedSet?.shopMoney?.currencyCode || "N/A",
              })) || [];

            orders[record.id] = {
              customerName,
              customerEmail,
              totalCost,
              currency,
              refunds,
              returns: [],
            };
          }
        } catch (parseError) {
          console.error(`Error parsing line: ${line}`, parseError);
        }
      }
    }

    // Associate returns with their respective orders
    for (const returnRecord of returns) {
      const parentOrder = orders[returnRecord.__parentId];
      if (parentOrder) {
        parentOrder.returns.push({
          returnId: returnRecord.id,
        });
      }
    }

    // Store records in the database
    for (const order of Object.values(orders)) {
      const createdOrder = await db.order.create({
        data: {
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          totalCost: order.totalCost,
          currency: order.currency,
          refunds: {
            create: order.refunds.map((refund) => ({
              refundId: refund.refundId,
              totalRefunded: refund.totalRefunded,
              refundCurrency: refund.refundCurrency,
            })),
          },
          returns: {
            create: order.returns.map((ret) => ({
              returnId: ret.returnId,
            })),
          },
        },
        include: {
          refunds: true,
          returns: true,
        },
      });

      console.log(`Stored order with ID: ${createdOrder.id}`);
    }

    console.log(`Successfully stored ${Object.keys(orders).length} records.`);
  } catch (error) {
    console.error(`Error fetching or processing data from URL: ${url}`, error);
  }
}
