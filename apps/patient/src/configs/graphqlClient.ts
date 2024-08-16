import { GraphQLClient } from 'graphql-request';
import { getSdk } from '../__generated__/graphql';

const client = new GraphQLClient((process.env as any).REACT_APP_GRAPHQL_API_ENDPOINT, {
  jsonSerializer: {
    parse: JSON.parse,
    stringify: JSON.stringify
  }
});

export const graphQLClient = getSdk(client);

export const setAuthHeader = (token: string) => {
  client.setHeaders({
    'x-photon-auth': token
  });
};
