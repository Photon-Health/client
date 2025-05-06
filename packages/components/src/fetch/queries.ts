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

export const GetPatientPreferredPharmacies = gql`
  query GetPatient($id: ID!) {
    patient(id: $id) {
      preferredPharmacies {
        id
        name
      }
    }
  }
`;
