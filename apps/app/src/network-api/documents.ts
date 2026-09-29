import { graphql } from './gql';

// network-api exposes no read queries — every mutation echoes the entity's current state, so
// calling one with only an `id` reads it back without changing anything.

graphql(/* GraphQL */ `
  fragment NetworkPrescriptionFields on Prescription {
    id
    status
    treatment {
      id
      name
      rxNormId
      ndc
    }
    instructions
    dispense {
      quantity
      unit
      daysSupply
      refillsAllowed
      dispenseAsWritten
    }
    clinical {
      notes
      diagnoses {
        icd10Code
      }
    }
    screeningAlerts {
      severity
      type
      description
    }
    signing {
      state
      contentHash
    }
  }
`);

graphql(/* GraphQL */ `
  fragment NetworkChangeFields on Change {
    key
    label
    status
    severity
    reason
  }
`);

export const NetworkOrderMutation = graphql(/* GraphQL */ `
  mutation NetworkOrder($input: OrderInput!, $metadata: RequestMetadata!) {
    order(input: $input, metadata: $metadata) {
      __typename
      ... on OrderPayload {
        order {
          id
          state
          pharmacy {
            id
            name
            address {
              street1
              street2
              city
              state
              postalCode
            }
          }
          patient {
            __typename
            ... on Patient {
              id
              demographic {
                name {
                  first
                  last
                }
                dateOfBirth
                sex
                gender
                email
                phone
                address {
                  street1
                  street2
                  city
                  state
                  postalCode
                  country
                }
              }
              clinical {
                notes
                allergies {
                  name
                }
              }
            }
          }
          prescriptions {
            ...NetworkPrescriptionFields
          }
        }
        unappliedChanges {
          ...NetworkChangeFields
        }
      }
      ... on AmbiguousOrderMatch {
        reason
      }
      ... on UnauthorizedError {
        code
        message
      }
      ... on UpstreamServiceError {
        code
        message
      }
    }
  }
`);

export const NetworkPatientMutation = graphql(/* GraphQL */ `
  mutation NetworkPatient($patient: PatientInput, $metadata: RequestMetadata!) {
    patient(patient: $patient, metadata: $metadata) {
      __typename
      ... on PatientPayload {
        patient {
          __typename
          ... on Patient {
            id
          }
        }
        unappliedChanges {
          ...NetworkChangeFields
        }
      }
      ... on AmbiguousPatientMatch {
        reason
        candidates {
          id
          firstName
          lastName
          dateOfBirth
        }
      }
      ... on UnauthorizedError {
        code
        message
      }
      ... on UpstreamServiceError {
        code
        message
      }
    }
  }
`);

export const NetworkPrescriptionMutation = graphql(/* GraphQL */ `
  mutation NetworkPrescription($prescription: PrescriptionInput, $metadata: RequestMetadata!) {
    prescription(prescription: $prescription, metadata: $metadata) {
      __typename
      ... on PrescriptionPayload {
        prescription {
          ...NetworkPrescriptionFields
        }
        unappliedChanges {
          ...NetworkChangeFields
        }
      }
      ... on AmbiguousPrescriptionMatch {
        reason
      }
      ... on UnauthorizedError {
        code
        message
      }
      ... on UpstreamServiceError {
        code
        message
      }
    }
  }
`);
