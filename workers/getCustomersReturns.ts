{
  customers(first: 1, query: "customer1@example.com") {
    edges {
      node {
        id
        email
        firstName
        lastName
        orders(first: 250) {
          edges {
            node {
              id
              refunds {
                id
                totalRefundedSet {
                 shopMoney {
              amount
              currencyCode
            }
          }
              }
            }
          }
        }
      }
    }
  }
}
