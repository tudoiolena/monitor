import { authenticate } from "../../../shopify.server";
import { ActionFunctionArgs } from "@remix-run/node";

interface ReturnPayload {
  buyerEmail: string;
  returnCost: number;
}

export const buyerAction = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, session, payload } = await authenticate.webhook(request);

  switch (topic) {
    case "ORDERS_CREATE":
      console.log("New order created: ", payload);
      break;

    case "ORDERS_UPDATED":
      console.log("Order updated: ", payload);
      break;

    case "RETURNS_CREATE":
      console.log("Return processed: ", payload);
      await analyzeReturns(payload as ReturnPayload);
      break;

    case "APP_UNINSTALLED":
      if (session) {
        await prisma.session.deleteMany({ where: { shop } });
      }
      break;

    default:
      throw new Response("Unhandled webhook topic", { status: 404 });
  }

  return new Response(null, { status: 200 });
};

async function analyzeReturns(payload: ReturnPayload) {
  const { buyerEmail, returnCost } = payload;

  const buyer = await prisma.buyer.findUnique({
    where: { email: buyerEmail },
  });

  if (buyer) {
    const updatedReturnCount = (buyer.returnCount ?? 0) + 1;
    const updatedReturnCost = (buyer.returnCost ?? 0) + returnCost;

    await prisma.buyer.update({
      where: { email: buyerEmail },
      data: {
        returnCount: updatedReturnCount,
        returnCost: updatedReturnCost,
        returnPercentage:
          Math.round((updatedReturnCount / (buyer.orderCount || 1)) * 100) || 0,
      },
    });
  } else {
    await prisma.buyer.create({
      data: {
        fullName: "Unknown",
        email: buyerEmail,
        orderCount: 0,
        returnCount: 1,
        returnPercentage: 100,
        returnCost: returnCost,
      },
    });
  }
}
