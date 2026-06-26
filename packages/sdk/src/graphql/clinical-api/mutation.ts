import { graphql } from './gql';

export const CreateSupervisorMutation = graphql(`
  mutation CreateSupervisorMutation(
    $firstName: String!
    $lastName: String!
    $npi: String!
    $phone: PhoneNumber!
    $address: AddressInput!
  ) {
    createSupervisor(
      input: {
        firstName: $firstName
        lastName: $lastName
        npi: $npi
        phone: $phone
        address: $address
      }
    ) {
      ...SupervisorCard
    }
  }
`);
