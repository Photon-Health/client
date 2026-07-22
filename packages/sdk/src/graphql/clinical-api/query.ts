import { graphql } from './gql';

export const SearchTreatmentsQuery = graphql(`
  query SearchTreatments($filter: TreatmentFilter!) {
    treatments(filter: $filter) {
      id
      name
      ... on Medication {
        recommendedDispenseUnits
      }
    }
  }
`);

export const SearchTreatmentOptionsQuery = graphql(`
  query SearchTreatmentOptionsQuery($filter: TreatmentFilter!) {
    treatments(filter: $filter) {
      __typename
      id
      name
      ... on Medication {
        recommendedDispenseUnits
      }
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

export const AnalyticsContextQuery = graphql(`
  query AnalyticsContextQuery {
    me {
      email
      id
      name {
        first
        full
        last
        middle
        title
      }
      roles {
        id
        name
      }
    }
    organization {
      customer {
        id
        name
      }
      name
      id
    }
  }
`);
