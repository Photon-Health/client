import gql from 'graphql-tag';

/**
 * client side:
 *   query GetOrder($id: ID!, $openAt: DateTime) {
 * query keyword = use Query top level parent
 * "GetOrder" is the name of our query on the client side
 * $id is an argument to GetOrder with type ID and required
 * $openAt is an argument to GetOrder with ttype DateTime and optional
 *
 * namespance query { function GetOrder(id: string, openAt?: DateTime); }
 *
 *
 *
 * server side:
 * invoke `Query.order` with argument `id` = `$id`
 * Ensure we return all (and only) the subfields requested
 *
 * let res = Query.order(_, { id: $id }, context, info): Order
 *    - return a PARTIAL of the OrderType
 *      - returns id, state, readyBy, ...
 *      - does NOT return isReroutable, fulfillment, pharmacy, etc
 *
 * let res["order"]["isReroutable"] = Order.isReroutable
 */

export const GET_ORDER = gql`
  query GetOrder($id: ID!, $openAt: DateTime) {
    order(id: $id) {
      id
      state
      isReroutable
      readyBy
      readyByTime
      readyByDay
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
          dispenseUnit
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
      fulfillments {
        id
        state
        exceptions {
          exceptionType
          message
          resolvedAt
        }
        patientDesiredAt
        patientDesiredByText
        pharmacyEstimatedReadyAt
        prescription {
          id
          daysSupply
          dispenseQuantity
          dispenseUnit
          expirationDate
          fillsAllowed
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
        }
      }
      discountCards {
        id
        prescriptionId
        price
        bin
        pcn
        group
        memberId
        pharmacyId
      }
    }
  }
`;

const PHARMACY_FIELDS = gql`
  fragment PharmacyFields on Pharmacy {
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
  ) {
    pharmaciesByLocation(
      location: $location
      limit: $limit
      offset: $offset
      openAt: $openAt
      is24hr: $is24hr
      name: $name
    ) {
      ...PharmacyFields
    }
  }
  ${PHARMACY_FIELDS}
`;

export const GET_PHARMACIES_WITH_PRICE = gql`
  query GetPharmaciesWithPriceByLocation(
    $location: LatLongSearch!
    $openAt: DateTime
    $is24hr: Boolean
  ) {
    pharmaciesWithPriceByLocation(location: $location, openAt: $openAt, is24hr: $is24hr) {
      pharmacy {
        ...PharmacyFields
      }
      price
    }
  }
  ${PHARMACY_FIELDS}
`;
