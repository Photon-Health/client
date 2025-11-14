import { gql } from '@apollo/client';

export const GetPrescription = gql`
  query GetPrescription($id: ID!) {
    prescription(id: $id) {
      id
      daysSupply
      dispenseAsWritten
      dispenseQuantity
      dispenseUnit
      instructions
      notes
      fillsAllowed
      treatment {
        id
        name
      }
    }
  }
`;

export const GetTemplatesFromCatalogs = gql`
  query TemplatesFromCatalogs {
    catalogs {
      templates {
        id
        daysSupply
        dispenseAsWritten
        dispenseQuantity
        dispenseUnit
        instructions
        notes
        fillsAllowed
        treatment {
          id
          name
        }
      }
    }
  }
`;

export const GetPatient = gql`
  query GetPatient($id: ID!) {
    patient(id: $id) {
      id
      preferredPharmacyId
      benefits {
        id
        bin
        groupId
        memberId
        pcn
      }
    }
  }
`;

export const GetPatientPreferredPharmaciesAndAddress = gql`
  query GetPatient($id: ID!) {
    patient(id: $id) {
      preferredPharmacies {
        id
        name
        address {
          street1
          city
          state
        }
      }
      address {
        street1
        street2
        city
        state
        postalCode
      }
    }
  }
`;

export const GetPharmaciesQuery = gql`
  query GetPharmacies($location: LatLongSearch!) {
    pharmacies(location: $location) {
      id
      name
      address {
        street1
        city
        state
      }
    }
  }
`;

export const ListPharmaciesQuery = gql`
  query GetMailOrderPharmacies(
    $name: String
    $fulfillmentType: FulfillmentType
    $integrated: Boolean
    $limit: Int
    $offset: Int
  ) {
    pharmacies(
      name: $name
      fulfillmentType: $fulfillmentType
      integrated: $integrated
      limit: $limit
      offset: $offset
    ) {
      id
      name
      address {
        street1
        city
        state
      }
    }
  }
`;
