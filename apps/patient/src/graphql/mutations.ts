import { gql } from 'graphql-request';

export const MARK_ORDER_AS_PICKED_UP = gql`
  mutation MarkOrderAsPickedUp($markOrderAsPickedUpId: ID!) {
    markOrderAsPickedUp(id: $markOrderAsPickedUpId)
  }
`;

export const SET_PREFERRED_PHARMACY = gql`
  mutation SetPreferredPharmacy($pharmacyId: String, $patientId: String) {
    setPreferredPharmacy(pharmacyId: $pharmacyId, patientId: $patientId)
  }
`;

export const REROUTE_ORDER = gql`
  mutation RerouteOrder($orderId: ID!, $pharmacyId: ID!, $patientSelectedPrice: Boolean) {
    rerouteOrder(
      orderId: $orderId
      pharmacyId: $pharmacyId
      patientSelectedPrice: $patientSelectedPrice
    )
  }
`;

export const SET_ORDER_PHARMACY = gql`
  mutation SetOrderPharmacy(
    $orderId: ID!
    $pharmacyId: ID!
    $readyBy: String
    $readyByDay: String
    $readyByTime: DateTime
    $patientSelectedPrice: Boolean
  ) {
    setOrderPharmacy(
      orderId: $orderId
      pharmacyId: $pharmacyId
      readyBy: $readyBy
      readyByDay: $readyByDay
      readyByTime: $readyByTime
      patientSelectedPrice: $patientSelectedPrice
    )
  }
`;

export const UPDATE_PATIENT = gql`
  mutation UpdatePatient($patientId: ID!, $input: UpdatePatientInput!) {
    updatePatient(patientId: $patientId, input: $input) {
      id
      address {
        street1
        street2
        city
        state
        postalCode
        country
      }
    }
  }
`;

export const UPDATE_ORDER = gql`
  mutation UpdateOrder($orderId: ID!, $input: UpdateOrderInput!) {
    updateOrder(orderId: $orderId, input: $input) {
      id
      address {
        street1
        street2
        city
        state
        postalCode
        country
      }
    }
  }
`;
