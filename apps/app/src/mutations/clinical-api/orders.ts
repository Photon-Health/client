import { graphql } from 'apps/app/src/gql';

export const rerouteOrderMutation = graphql(/* GraphQL */ `
  mutation RerouteOrder($orderId: ID!, $pharmacyId: ID) {
    rerouteOrder(orderId: $orderId, pharmacyId: $pharmacyId)
  }
`);
