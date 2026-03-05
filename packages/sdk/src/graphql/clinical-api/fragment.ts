import { graphql } from './gql';

graphql(`
  fragment SupervisorCard on Supervisor {
    id
    fullName
    npi
  }
`);
