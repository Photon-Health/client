import gql from 'graphql-tag';

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
      refillsAllowed: $refillsAllowed #todo: remove this?
      fillsAllowed: $fillsAllowed
      daysSupply: $daysSupply
      instructions: $instructions
      notes: $notes
      effectiveDate: $effectiveDate
      diagnoses: $diagnoses
    ) {
      id
      externalId
      dispenseAsWritten
      dispenseQuantity
      dispenseUnit
      fillsAllowed
      daysSupply
      instructions
      notes
      effectiveDate
      diagnoses {
        code
      }
      treatment {
        id
        name
      }
    }
  }
`;

export const UpdatePrescriptionStates = gql`
  mutation UpdatePrescriptionStates($input: UpdatePrescriptionStatesInput!) {
    updatePrescriptionStates(input: $input)
  }
`;

export const GenerateCoverageOptions = gql`
  mutation GenerateCoverageOptions($pharmacyId: ID!, $prescriptions: [CoverageRxInput!]!) {
    generateCoverageOptions(pharmacyId: $pharmacyId, prescriptions: $prescriptions) {
      id
      prescriptionId
      isAlternative
      status
      statusMessage
      paRequired
      price
      daysSupply
      dispenseQuantity
      dispenseUnit
      treatment {
        name
        id
      }
      alerts {
        label
        text
      }
    }
  }
`;
