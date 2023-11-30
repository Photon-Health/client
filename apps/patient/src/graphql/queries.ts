import { gql } from 'graphql-request';

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
  query GetPharmaciesByLocation(
    $location: LatLongSearch!
    $limit: Int
    $offset: Int # $openAt: String
    $isOpenAt: DateTime
  ) {
    pharmaciesByLocation(location: $location, limit: $limit, offset: $offset, isOpen: $isOpenAt) {
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
      isOpen
    }
  }
`;
