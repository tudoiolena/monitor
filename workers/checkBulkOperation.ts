import type { UnauthenticatedAdminContext } from "@shopify/shopify-app-remix/server";

export async function checkBulkOperationStatus(
  graphql: UnauthenticatedAdminContext["admin"]["graphql"],
  operationId: string,
) {
  const query = `
    {
      node(id: "${operationId}") {
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

  const response = await graphql(query);
  return await response.json();
}
