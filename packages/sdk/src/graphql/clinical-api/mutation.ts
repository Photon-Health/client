import { graphql } from './gql';

export const CreateSupervisorMutation = graphql(`
  mutation CreateSupervisorMutation($fullName: String!, $npi: String!) {
    createSupervisor(input: { fullName: $fullName, npi: $npi }) {
      ...SupervisorCard
    }
  }
`);
