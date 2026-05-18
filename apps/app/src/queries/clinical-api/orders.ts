import { graphql } from 'apps/app/src/gql';

export const getOrderRoutingHistory = graphql(/* GraphQL */ `
  query GetOrder($id: ID!) {
    order(id: $id) {
      routingHistory {
        pharmacy {
          id
          name
          fulfillmentTypes
          id
          name
          phone
          address {
            city
            country
            postalCode
            state
            street1
            street2
          }
        }
        selector
        reason
        createdAt
      }
    }
  }
`);
