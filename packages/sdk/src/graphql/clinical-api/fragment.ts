import { graphql } from './gql';

graphql(`
  fragment SupervisorCard on Supervisor {
    id
    firstName
    lastName
    npi
  }
`);
