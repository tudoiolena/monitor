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
  let costOfReturns = 0;
  const customerName = orders[0].customerName;

  for (const order of orders) {
    if (order.returns && order.returns.length > 0) {
      returnCount += 1;
    }

    if (order.refunds && order.refunds.length > 0) {
      costOfReturns += order.refunds.reduce((sum, refund) => {
        return sum + refund.totalRefunded;
      }, 0);
    }
  }

  const returnPercentage =
    orderCount > 0 ? Math.round((returnCount * 100) / orderCount) : "N/A";

  const presentationRecord = await db.presentationTable.upsert({
    where: { customerEmail },
    update: {
      orderCount,
      returnCount,
      returnPercetage: `${returnPercentage}%`,
      costOfReturns,
      customerName,
    },
    create: {
      customerName,
      customerEmail,
      orderCount,
      returnCount,
      returnPercetage: `${returnPercentage}%`,
      costOfReturns,
    },
  });

  return presentationRecord;
}
