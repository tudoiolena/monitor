import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Button, Card, Page, Text } from "@shopify/polaris";
import db from "../db.server";
import { useCallback } from "react";
import { Form } from "@remix-run/react";
import { authenticate } from "app/shopify.server";

export const action: ActionFunction = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  await db.bulkOperation.create({
    data: {
      operationId: "",
      status: "PENDING",
      error: "",
      retryCount: 0,
      maxRetries: 3,
      inProgress: false,
      urlToFile: "",
      shop: shop,
    },
  });

  return redirect("/app/status");
};

export default function BulkOrderExport() {
  const primaryAction = useCallback(
    () => (
      <Button submit={true} variant="primary">
        Start importing orders
      </Button>
    ),
    [],
  );
  return (
    <Form method="post">
      <Page primaryAction={primaryAction()}>
        <Card>
          <Text as="p">
            Click the button to initiate a bulk order export for orders.
          </Text>
        </Card>
      </Page>
    </Form>
  );
}
