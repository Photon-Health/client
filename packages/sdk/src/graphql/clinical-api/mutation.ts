import { graphql } from './gql';

export const CreateSupervisorMutation = graphql(`
  mutation CreateSupervisorMutation($firstName: String!, $lastName: String!, $npi: String!) {
    createSupervisor(input: { firstName: $firstName, lastName: $lastName, npi: $npi }) {
      ...SupervisorCard
    }
  }
`);
