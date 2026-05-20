import { gql } from '@apollo/client';

export const PHARMACY_FRAGMENT = gql`
  fragment PharmacyFragment on Pharmacy {
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
`;

export const PHARMACY_QUERY = gql`
  ${PHARMACY_FRAGMENT}

  query GetPharmacy($id: ID!) {
    pharmacy(id: $id) {
      ...PharmacyFragment
    }
  }
`;
