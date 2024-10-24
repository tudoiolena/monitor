import { useLoaderData } from "@remix-run/react";
import { Page, Card, Text } from "@shopify/polaris";
import { statusLoader } from "../services/.server/loaders/status.loader";

export const loader = statusLoader;

export default function BulkOrderStatus() {
  const { status } = useLoaderData<typeof loader>();

  return (
    <Page>
      <Card>
        <Text as="p">Status : {status}</Text>
      </Card>
    </Page>
  );
}
