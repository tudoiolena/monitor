import { Layout, Page } from "@shopify/polaris";
import { Outlet } from "@remix-run/react";

export default function Order() {
  return (
    <Page narrowWidth>
      <Layout>
        <Layout.Section>
          <Outlet />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
