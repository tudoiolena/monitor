import db from "../app/db.server";

export async function parseAndStoreData(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.text();
    const lines = data.split("\n");
    const records: any[] = [];

    for (const line of lines) {
      if (line.trim()) {
        try {
          const record = JSON.parse(line);

          const customerName =
            `${record.customer?.firstName || ""} ${record.customer?.lastName || ""}`.trim();
          const customerEmail = record.customer?.email || "";
          const totalCost = record.totalPriceSet?.shopMoney?.amount * 10 || 0;
          const currency =
            record.totalPriceSet?.shopMoney?.currencyCode || "N/A";

          const refunds =
            record.refunds?.map((refund: any) => ({
              refundId: refund.id || "N/A",
              totalRefunded:
                refund.totalRefundedSet?.shopMoney?.amount * 10 || 0,
              refundCurrency:
                refund.totalRefundedSet?.shopMoney?.currencyCode || "N/A",
            })) || [];

          const returns =
            record.returns?.edges?.map((returnEdge: any) => ({
              returnId: returnEdge?.node?.id || "N/A",
            })) || [];

          records.push({
            customerName,
            customerEmail,
            totalCost,
            currency,
            refunds,
            returns,
          });
        } catch (parseError) {
          console.error(`Error parsing line: ${line}`, parseError);
        }
      }
    }

    for (const record of records) {
      const createdOrder = await db.order.create({
        data: {
          customerName: record.customerName,
          customerEmail: record.customerEmail,
          totalCost: record.totalCost,
          currency: record.currency,
          refunds: {
            create: record.refunds.map((refund: any) => ({
              refundId: refund.refundId,
              totalRefunded: refund.totalRefunded,
              refundCurrency: refund.refundCurrency,
            })),
          },
          returns: {
            create: record.returns.map((ret: any) => ({
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

    console.log(`Successfully stored ${records.length} records.`);
  } catch (error) {
    console.error(`Error fetching or processing data from URL: ${url}`, error);
  }
}
