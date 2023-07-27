import { gql } from 'graphql-request';

/**
 * Queries
 */

export const GET_ORDER = gql`
  query order($id: ID!) {
    order(id: $id) {
      id
      state
      address {
        street1
        street2
        city
        state
        country
        postalCode
      }
      organization {
        id
        name
      }
      fulfillment {
        type
        state
        trackingNumber
      }
      pharmacy {
        id
        name
        address {
          street1
          street2
          city
          state
          country
          postalCode
        }
      }
      fills {
        id
        treatment {
          ... on Medication {
            id
            name
            strength
          }
          ... on MedicalEquipment {
            id
            name
          }
          ... on Compound {
            id
            name
          }
        }
        prescription {
          id
          daysSupply
          dispenseQuantity
          expirationDate
          fillsAllowed
          instructions
        }
      }
      patient {
        id
        name {
          full
        }
      }
    }
  }
`;

export const GET_PHARMACIES = gql`
  query GetPharmaciesByLocation($location: LatLongSearch!, $limit: Int, $offset: Int) {
    pharmaciesByLocation(location: $location, limit: $limit, offset: $offset) {
      id
      name
      address {
        street1
        street2
        city
        state
        country
        postalCode
      }
      distance
    }
  }
`;

/**
 * Mutations
 */

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
  mutation RerouteOrder($orderId: ID!, $pharmacyId: String) {
    rerouteOrder(orderId: $orderId, pharmacyId: $pharmacyId)
  }
`;
