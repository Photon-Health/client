import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
  OnQueryUpdated
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context/index.js';
import { PhotonClient } from '@photonhealth/sdk';

let _apollo: ApolloClient<NormalizedCacheObject> | undefined;
let _photonClient: PhotonClient | undefined;

// https://github.com/apollographql/apollo-feature-requests/issues/207
const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));
const delayRefetchedQuery: OnQueryUpdated<unknown> = async (observableQuery) => {
  await wait(1000); // 1s to make it super obvious if working or not
  observableQuery.refetch();
};

export const clinicalApolloClient = (photonClient: PhotonClient) => {
  if (_apollo && _photonClient && photonClient == photonClient) {
    return _apollo;
  }

  const clinicalApiUrl = `${
    photonClient.clinicalUrl?.includes('photon')
      ? 'https://clinical-api.photon.health'
      : photonClient.clinicalUrl?.includes('neutron')
      ? 'https://clinical-api.neutron.health'
      : photonClient.clinicalUrl?.includes('tau')
      ? 'https://clinical-api.tau.health:8080'
      : 'https://clinical-api.boson.health'
  }/graphql`;

  const client = new ApolloClient({
    link: setContext(async (_, { headers, ...rest }) => {
      const token = await photonClient.authentication.getAccessToken();

      if (!token) {
        return { headers, ...rest };
      }

      return {
        ...rest,
        headers: {
          ...headers,
          'x-photon-auth-token': token,
          'x-photon-auth-token-type': 'auth0'
        }
      };
    }).concat(new HttpLink({ uri: clinicalApiUrl })),
    defaultOptions: {
      query: {
        fetchPolicy: 'cache-first',
        errorPolicy: 'all'
      },
      mutate: {
        // Because we do strong CQRS, we have a _slight_ delay between reads and writes
        // This forces a delay of 1s which isn't the greatest, but also isn't the worst
        // https://github.com/apollographql/apollo-feature-requests/issues/207
        onQueryUpdated: delayRefetchedQuery
      }
    },

    cache: new InMemoryCache()
  });
  _photonClient = photonClient;
  _apollo = client;
  return client;
};
