import { gql } from 'graphql-request';

export const GET_ORDER = gql`
  query order($id: ID!, $openAt: DateTime) {
    order(id: $id) {
      id
      state
      isReroutable
      readyBy
      readyByTime
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
        pharmacyEstimatedReadyAt
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
        isOpen(at: $openAt)
        nextEvents(at: $openAt) {
          open {
            ... on PharmacyOpenEvent {
              type
              datetime
            }
            ... on PharmacyCloseEvent {
              type
              datetime
            }
            ... on PharmacyOpen24HrEvent {
              type
            }
          }
          close {
            ... on PharmacyOpenEvent {
              type
              datetime
            }
            ... on PharmacyCloseEvent {
              type
              datetime
            }
            ... on PharmacyOpen24HrEvent {
              type
            }
          }
        }
        hours {
          dayOfWeek
          is24Hr
          openFrom
          openUntil
          timezone
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
    $offset: Int
    $openAt: DateTime
    $is24hr: Boolean
    $name: String
    $includePrice: Boolean
  ) {
    pharmaciesByLocation(
      location: $location
      limit: $limit
      offset: $offset
      openAt: $openAt
      is24hr: $is24hr
      name: $name
      includePrice: $includePrice
    ) {
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
      isOpen(at: $openAt)
      nextEvents(at: $openAt) {
        open {
          ... on PharmacyOpenEvent {
            type
            datetime
          }
          ... on PharmacyCloseEvent {
            type
            datetime
          }
          ... on PharmacyOpen24HrEvent {
            type
          }
        }
        close {
          ... on PharmacyOpenEvent {
            type
            datetime
          }
          ... on PharmacyCloseEvent {
            type
            datetime
          }
          ... on PharmacyOpen24HrEvent {
            type
          }
        }
      }
      hours {
        dayOfWeek
        is24Hr
        openFrom
        openUntil
        timezone
      }
      medicationPrice
    }
  }
`;
