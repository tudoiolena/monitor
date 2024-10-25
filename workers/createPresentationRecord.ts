import db from "app/db.server";

export async function createPresentationRecord(customerEmail: string) {
  const orders = await db.order.findMany({
    where: { customerEmail },
    include: {
      refunds: true,
      returns: true,
    },
  });

  const orderCount = orders.length;
  let returnCount = 0;
  let costOfReturnsAmount = 0;
  const customerName = orders[0].customerName;
  const currency = orders[0].currency;

  for (const order of orders) {
    if (order.returns && order.returns.length > 0) {
      returnCount += 1;
    }

    if (order.refunds && order.refunds.length > 0) {
      costOfReturnsAmount += order.refunds.reduce((sum, refund) => {
        return sum + refund.totalRefunded;
      }, 0);
    }
  }

  const returnPercentage =
    orderCount > 0 ? Math.round((returnCount * 100) / orderCount) : "N/A";

  const formattedCostOfReturns =
    (costOfReturnsAmount / 100).toFixed(2) + ` ${currency}`;

  const presentationRecord = await db.presentationTable.upsert({
    where: { customerEmail },
    update: {
      orderCount,
      returnCount,
      returnPercetage: `${returnPercentage}%`,
      costOfReturns: formattedCostOfReturns,
      customerName,
    },
    create: {
      customerName,
      customerEmail,
      orderCount,
      returnCount,
      returnPercetage: `${returnPercentage}%`,
      costOfReturns: formattedCostOfReturns,
    },
  });

  return presentationRecord;
}
