import { GraphQLClient } from 'graphql-request';

export const graphQLClient = new GraphQLClient((process.env as any).REACT_APP_GRAPHQL_API_ENDPOINT, {
  jsonSerializer: {
    parse: JSON.parse,
    stringify: JSON.stringify
  }
});

export const setAuthHeader = (token: string) => {
  graphQLClient.setHeaders({
    'x-photon-auth': token
  });
};
