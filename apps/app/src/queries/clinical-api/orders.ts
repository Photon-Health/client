import { graphql } from 'apps/app/src/gql';

export const getOrderRoutingHistory = graphql(/* GraphQL */ `
  query GetOrder($id: ID!) {
    order(id: $id) {
      routingHistory {
        pharmacy {
          id
          name
          fulfillmentTypes
        }
        selector
        reason
        createdAt
      }
    }
  }
`);
