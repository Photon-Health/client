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

graphql(`
  fragment SupervisorCard on Supervisor {
    id
    fullName
    npi
  }
`);

export const SupervisorsQuery = graphql(`
  query SupervisorsQuery {
    supervisors {
      ...SupervisorCard
    }
  }
`);

export const CreateSupervisorMutation = graphql(`
  mutation CreateSupervisorMutation($fullName: String!, $npi: String!) {
    createSupervisor(input: { fullName: $fullName, npi: $npi }) {
      ...SupervisorCard
    }
  }
`);
