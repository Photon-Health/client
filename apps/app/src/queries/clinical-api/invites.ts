import { graphql } from 'apps/app/src/gql';

export const myInvitesQuery = graphql(/* GraphQL */ `
  query MyInvites {
    myInvites {
      id
      email
      organizationId
      organizationName
      inviter
      expired
    }
  }
`);
