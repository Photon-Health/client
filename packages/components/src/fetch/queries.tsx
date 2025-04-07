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

export const CreatePrescriptionTemplate = gql`
  mutation CreatePrescriptionTemplate(
    $catalogId: ID!
    $name: String
    $treatmentId: ID!
    $dispenseAsWritten: Boolean
    $dispenseQuantity: Float
    $dispenseUnit: String
    $refillsAllowed: Int
    $fillsAllowed: Int
    $daysSupply: Int
    $instructions: String
    $notes: String
    $isPrivate: Boolean
  ) {
    createPrescriptionTemplate(
      catalogId: $catalogId
      name: $name
      treatmentId: $treatmentId
      dispenseAsWritten: $dispenseAsWritten
      dispenseQuantity: $dispenseQuantity
      dispenseUnit: $dispenseUnit
      refillsAllowed: $refillsAllowed
      fillsAllowed: $fillsAllowed
      daysSupply: $daysSupply
      instructions: $instructions
      notes: $notes
      isPrivate: $isPrivate
    ) {
      id
    }
  }
`;

export const CreatePrescription = gql`
  mutation CreatePrescription(
    $externalId: ID
    $patientId: ID!
    $treatmentId: ID!
    $dispenseAsWritten: Boolean
    $dispenseQuantity: Float!
    $dispenseUnit: String!
    $refillsAllowed: Int
    $fillsAllowed: Int
    $daysSupply: Int
    $instructions: String!
    $notes: String
    $effectiveDate: AWSDate
    $diagnoses: [ID]
  ) {
    createPrescription(
      externalId: $externalId
      patientId: $patientId
      treatmentId: $treatmentId
      dispenseAsWritten: $dispenseAsWritten
      dispenseQuantity: $dispenseQuantity
      dispenseUnit: $dispenseUnit
      refillsAllowed: $refillsAllowed
      fillsAllowed: $fillsAllowed
      daysSupply: $daysSupply
      instructions: $instructions
      notes: $notes
      effectiveDate: $effectiveDate
      diagnoses: $diagnoses
    ) {
      id
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
