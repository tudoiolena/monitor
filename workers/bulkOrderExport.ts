import type { UnauthenticatedAdminContext } from "@shopify/shopify-app-remix/server";

export async function bulkOrderExport(
  graphql: UnauthenticatedAdminContext["admin"]["graphql"],
) {
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

  const response = await graphql(mutation);
  return await response.json();
}
