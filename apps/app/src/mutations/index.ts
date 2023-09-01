import gql from 'graphql-tag';

export const CANCEL_ORDER = gql`
  mutation cancel($id: ID!, $reason: String) {
    cancelOrder(id: $id, reason: $reason) {
      __typename
      id
      state
    }
  }
`;

export const REROUTE_ORDER = gql`
  mutation RouteOrder($id: ID!, $pharmacyId: ID!) {
    routeOrder(id: $id, pharmacyId: $pharmacyId) {
      id
    }
  }
`;

export const CANCEL_PRESCRIPTION = gql`
  mutation cancel($id: ID!) {
    cancelPrescription(id: $id) {
      id
    }
  }
`;
