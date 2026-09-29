import { graphql } from './gql';

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

graphql(/* GraphQL */ `
  fragment DraftOrderQuestionFields on OrderQuestion {
    id
    key
    text
    reason
    authorOrganizationId
    answer {
      text
      boolean
      date
      choices
    }
    answeredAt
    createdAt
  }
`);

graphql(/* GraphQL */ `
  fragment DraftOrderClaimFields on PhotonPpDraftOrder {
    id
    createdAt
    claim {
      organizationId
      claimedAt
      waitingForPatient
      patientId
      claimedByUserId
      claimedByMe
    }
    outcome {
      status
      closedAt
      orderId
      rejectionReason
    }
  }
`);

graphql(/* GraphQL */ `
  fragment DraftOrderSummaryFields on PhotonPpDraftOrder {
    ...DraftOrderClaimFields
    order {
      id
      state
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
            address {
              state
            }
          }
        }
      }
      prescriptions {
        id
        treatment {
          id
          name
        }
      }
      questions {
        ...DraftOrderQuestionFields
      }
    }
  }
`);

graphql(/* GraphQL */ `
  fragment DraftOrderDetailFields on PhotonPpDraftOrder {
    ...DraftOrderClaimFields
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
            address {
              state
            }
          }
          clinical {
            allergies {
              name
            }
          }
        }
      }
      prescriptions {
        ...NetworkPrescriptionFields
      }
      questions {
        ...DraftOrderQuestionFields
      }
    }
  }
`);

graphql(/* GraphQL */ `
  fragment DraftOrderResultFields on PhotonPpDraftOrderResult {
    __typename
    ... on PhotonPpDraftOrderPayload {
      draftOrder {
        ...DraftOrderDetailFields
      }
    }
    ... on InvalidInputError {
      code
      message
    }
    ... on NotFoundError {
      code
      message
    }
    ... on ConflictError {
      code
      message
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
`);

export const PhotonPpDraftOrdersQuery = graphql(/* GraphQL */ `
  query PhotonPpDraftOrders($filter: PhotonPpDraftOrderFilter!, $first: Int, $after: String) {
    photonPpDraftOrders(filter: $filter, first: $first, after: $after) {
      __typename
      ... on PhotonPpDraftOrderConnection {
        nodes {
          ...DraftOrderSummaryFields
        }
        endCursor
        hasNextPage
        totalCount
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

export const PhotonPpDraftOrderCountsQuery = graphql(/* GraphQL */ `
  query PhotonPpDraftOrderCounts {
    toReview: photonPpDraftOrders(filter: UNCLAIMED, first: 1) {
      ... on PhotonPpDraftOrderConnection {
        totalCount
      }
    }
    myReviews: photonPpDraftOrders(filter: MY_REVIEWS, first: 1) {
      ... on PhotonPpDraftOrderConnection {
        totalCount
      }
    }
    waitingOnPatient: photonPpDraftOrders(filter: WAITING_ON_PATIENT, first: 1) {
      ... on PhotonPpDraftOrderConnection {
        totalCount
      }
    }
    closed: photonPpDraftOrders(filter: CLOSED, first: 1) {
      ... on PhotonPpDraftOrderConnection {
        totalCount
      }
    }
  }
`);

export const PhotonPpDraftOrderQuery = graphql(/* GraphQL */ `
  query PhotonPpDraftOrder($id: ID!) {
    photonPpDraftOrder(id: $id) {
      ...DraftOrderResultFields
    }
  }
`);

export const PhotonPpPatientHistoryQuery = graphql(/* GraphQL */ `
  query PhotonPpPatientHistory($patientId: ID!) {
    photonPpPatientOrders(patientId: $patientId, first: 25) {
      __typename
      ... on PhotonPpPatientOrderConnection {
        nodes {
          organizationId
          patientId
          createdAt
          order {
            id
            state
            prescriptions {
              id
              treatment {
                id
                name
              }
            }
          }
        }
      }
      ... on NotFoundError {
        code
        message
      }
      ... on UnauthorizedError {
        code
        message
      }
      ... on InvalidInputError {
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

export const ClaimDraftOrderMutation = graphql(/* GraphQL */ `
  mutation ClaimDraftOrder($id: ID!, $metadata: RequestMetadata!) {
    claimDraftOrder(id: $id, metadata: $metadata) {
      ...DraftOrderResultFields
    }
  }
`);

export const RejectDraftOrderMutation = graphql(/* GraphQL */ `
  mutation RejectDraftOrder($id: ID!, $reason: String!, $metadata: RequestMetadata!) {
    rejectDraftOrder(id: $id, reason: $reason, metadata: $metadata) {
      ...DraftOrderResultFields
    }
  }
`);

export const SetDraftOrderWaitingForPatientMutation = graphql(/* GraphQL */ `
  mutation SetDraftOrderWaitingForPatient(
    $id: ID!
    $waitingForPatient: Boolean!
    $metadata: RequestMetadata!
  ) {
    setDraftOrderWaitingForPatient(
      id: $id
      waitingForPatient: $waitingForPatient
      metadata: $metadata
    ) {
      ...DraftOrderResultFields
    }
  }
`);

export const ApproveDraftOrderMutation = graphql(/* GraphQL */ `
  mutation ApproveDraftOrder($id: ID!, $prescriptionIds: [ID!]!, $metadata: RequestMetadata!) {
    approveDraftOrder(id: $id, prescriptionIds: $prescriptionIds, metadata: $metadata) {
      ...DraftOrderResultFields
    }
  }
`);

export const AddDraftOrderQuestionsMutation = graphql(/* GraphQL */ `
  mutation AddDraftOrderQuestions(
    $id: ID!
    $questions: [DraftOrderQuestionInput!]!
    $metadata: RequestMetadata!
  ) {
    addDraftOrderQuestions(id: $id, questions: $questions, metadata: $metadata) {
      __typename
      ... on DraftOrderQuestionsPayload {
        order {
          id
        }
      }
      ... on InvalidInputError {
        code
        message
      }
      ... on NotFoundError {
        code
        message
      }
      ... on ConflictError {
        code
        message
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
