import { graphql } from './gql';

export const SearchTreatmentsQuery = graphql(`
  query SearchTreatments($filter: TreatmentFilter!) {
    treatments(filter: $filter) {
      id
      name
    }
  }
`);

export const SearchTreatmentOptionsQuery = graphql(`
  query SearchTreatmentOptionsQuery($filter: TreatmentFilter!) {
    treatments(filter: $filter) {
      __typename
      id
      name
    }
  }
`);

export const MeUserQuery = graphql(`
  query MeUserQuery {
    me {
      id
      credentials
      address {
        state
      }
    }
  }
`);

export const SupervisorCardQuery = graphql(`
  query SupervisorCardQuery {
    supervisors {
      ...SupervisorCard
    }
    mostRecentSupervisor {
      id
    }
  }
`);

export const ScreenDraftedPrescriptionsQuery = graphql(`
  query ScreenDraftedPrescriptionsQuery(
    $draftedPrescriptions: [DraftedPrescriptionInput!]!
    $patientId: ID!
    $diagnosisCodes: [DiagnosisCode!]
  ) {
    prescriptionScreen(
      draftedPrescriptions: $draftedPrescriptions
      patientId: $patientId
      diagnosisCodes: $diagnosisCodes
    ) {
      alerts {
        type
        description
        involvedEntities {
          id
          name
          __typename
        }
        severity
      }
    }
  }
`);
