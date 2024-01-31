import { gql } from 'graphql-tag';

export const CATALOG_TREATMENTS_FIELDS = gql`
  fragment CatalogTreatmentsFieldsAppFragment on Catalog {
    treatments {
      id
      name
    }
    templates {
      name
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
      isPrivate
    }
  }
`;
export const PATIENT_FIELDS = gql`
  fragment PatientFieldsAppFragment on Patient {
    id
    externalId
    name {
      full
    }
    dateOfBirth
    sex
    gender
    email
    phone
    address {
      name {
        full
      }
      city
      country
      postalCode
      state
      street1
      street2
    }
    preferredPharmacies {
      id
      name
      phone
      fulfillmentTypes
      address {
        city
        country
        postalCode
        state
        street1
        street2
      }
    }
  }
`;
