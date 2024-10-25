import { useLoaderData } from "@remix-run/react";
import {
  IndexFilters,
  IndexTable,
  LegacyCard,
  Text,
  useIndexResourceState,
} from "@shopify/polaris";
import { getOrdersLoader } from "app/services/.server/loaders/orders.loader";
import { useCallback, useState } from "react";

export const loader = getOrdersLoader;

//FIXME: Rewrite the table to look like in the task!
export default function OrderList() {
  const { orders } = useLoaderData<typeof loader>();

  const [queryValue, setQueryValue] = useState<string | undefined>("");

  const handleQueryValueChange = useCallback(
    (value: string) => setQueryValue(value),
    [],
  );

  // Filter orders based on the query value (customer name or email) - they are not rendered yet
  const filteredOrders = orders.filter(
    ({ customerName, customerEmail }) =>
      customerName.toLowerCase().includes(queryValue?.toLowerCase() || "") ||
      customerEmail.toLowerCase().includes(queryValue?.toLowerCase() || ""),
  );

  const resourceName = {
    singular: "order",
    plural: "orders",
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(filteredOrders);

  const rowMarkup = filteredOrders.map(
    ({
      id,
      customerName,
      orderCount,
      returnCount,
      returnPercetage,
      costOfReturns,
      customerEmail,
    }) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
      >
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as="span">
            {customerName}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{orderCount}</IndexTable.Cell>
        <IndexTable.Cell>{returnCount}</IndexTable.Cell>
        <IndexTable.Cell>{returnPercetage}</IndexTable.Cell>
        <IndexTable.Cell>{costOfReturns}</IndexTable.Cell>
        <IndexTable.Cell>{customerEmail}</IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  return (
    <LegacyCard>
      <IndexFilters
        queryValue={queryValue}
        queryPlaceholder="Search by customer name or email"
        onQueryChange={handleQueryValueChange}
        onQueryClear={() => setQueryValue("")}
        filters={[]}
        appliedFilters={[]}
        onClearAll={() => {
          setQueryValue("");
        }}
        selected={0}
        tabs={[]}
      />
      <IndexTable
        resourceName={resourceName}
        itemCount={filteredOrders.length}
        selectedItemsCount={
          allResourcesSelected ? "All" : selectedResources.length
        }
        onSelectionChange={handleSelectionChange}
        headings={[
          { title: "Name" },
          { title: "Orders" },
          { title: "Returns" },
          { title: "Return Percentage" },
          { title: "Cost of Returns" },
          { title: "Email" },
        ]}
      >
        {rowMarkup}
      </IndexTable>
    </LegacyCard>
  );
}
