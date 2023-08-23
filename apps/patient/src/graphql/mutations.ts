import { gql } from 'graphql-request';

export const MARK_ORDER_AS_PICKED_UP = gql`
  mutation MarkOrderAsPickedUp($markOrderAsPickedUpId: ID!) {
    markOrderAsPickedUp(id: $markOrderAsPickedUpId)
  }
`;

export const SELECT_ORDER_PHARMACY = gql`
  mutation SelectOrderPharmacy($orderId: ID!, $pharmacyId: String, $patientId: String) {
    selectOrderPharmacy(orderId: $orderId, pharmacyId: $pharmacyId, patientId: $patientId)
  }
`;

export const SET_PREFERRED_PHARMACY = gql`
  mutation SetPreferredPharmacy($pharmacyId: String, $patientId: String) {
    setPreferredPharmacy(pharmacyId: $pharmacyId, patientId: $patientId)
  }
`;

export const REROUTE_ORDER = gql`
  mutation RerouteOrder($orderId: ID!, $pharmacyId: String, $patientId: String) {
    rerouteOrder(orderId: $orderId, pharmacyId: $pharmacyId, patientId: $patientId)
  }
`;