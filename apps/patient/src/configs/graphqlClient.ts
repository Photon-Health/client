import { GraphQLClient } from 'graphql-request';

export const graphQLClient = new GraphQLClient(process.env.REACT_APP_GRAPHQL_API_ENDPOINT, {
  jsonSerializer: {
    parse: JSON.parse,
    stringify: JSON.stringify
  }
});
