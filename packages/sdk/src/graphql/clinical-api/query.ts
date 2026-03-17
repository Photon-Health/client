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
      name {
        title
      }
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
