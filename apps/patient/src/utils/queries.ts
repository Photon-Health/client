import { gql } from 'graphql-request'

export const GET_ORDER = gql`
  query order($id: ID!) {
    order(id: $id) {
      id
      state
      organization {
        id
        name
      }
      fulfillment {
        state
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
      patient {
        id
      }
    }
  }
`

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
`
