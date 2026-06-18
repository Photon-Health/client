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
