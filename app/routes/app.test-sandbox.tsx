import type { ActionFunction } from "@remix-run/node";
import { Button, Page } from "@shopify/polaris";
import { useCallback } from "react";
import { Form } from "@remix-run/react";
import shopify from "../shopify.server";

export const action: ActionFunction = async () => {
  const shop = "app-tutorial-test.myshopify.com";
  try {
    const { admin } = await shopify.unauthenticated.admin(shop);
    console.log("admin");

    const query = `
    {
      orders(first: 250) {
        edges {
          node {
            id
            customer {
              email
              firstName
              lastName
            }
            totalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `;

    const mutation = `
    mutation {
      bulkOperationRunQuery(query: """${query}""") {
        bulkOperation {
          id
          status
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

    const response = await admin.graphql(mutation);
    const data = await response.json();
    console.log("JSON.stringify: ", JSON.stringify(data, null, 2));

    const query2 = `
    {
      node(id: "${data.data.bulkOperationRunQuery.bulkOperation?.id}") {
        ... on BulkOperation {
          id
          status
          errorCode
          createdAt
          completedAt
          objectCount
          fileSize
          url
        }
      }
    }
  `;

    const response2 = await admin.graphql(query2);
    const data2 = await response2.json();
    console.log("123 RESPONSE ", JSON.stringify(data2, null, 2));
  } catch (error) {
    console.log("test error", error);
  }

  return "321";
};

export default function Test() {
  const primaryAction = useCallback(
    () => (
      <Button submit={true} variant="primary">
        Start Testing
      </Button>
    ),
    [],
  );
  return (
    <Form method="post">
      <Page primaryAction={primaryAction()}></Page>
    </Form>
  );
}
