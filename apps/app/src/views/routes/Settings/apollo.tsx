import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  NormalizedCacheObject,
  OnQueryUpdated,
  useApolloClient
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context/index.js';
import { PhotonClient } from '@photonhealth/sdk';
import { createContext, useContext } from 'react';

let _apollo: ApolloClient<NormalizedCacheObject> | undefined;
let _photonClient: PhotonClient | undefined;

const clinicalApiUrl = process.env.REACT_APP_CLINICAL_GRAPHQL_URI as string;

// https://github.com/apollographql/apollo-feature-requests/issues/207
const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));
const delayRefetchedQuery: OnQueryUpdated<unknown> = async (observableQuery) => {
  await wait(1000); // 1s to make it super obvious if working or not
  observableQuery.refetch();
};

const apollo = (photonClient: PhotonClient) => {
  if (_apollo && _photonClient && photonClient == photonClient) {
    return _apollo;
  }

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

const stub = (): never => {
  throw new Error('You forgot to wrap your component in <ClinicalApiProvider>.');
};

const ClinicalApiContext = createContext<
  | {
      clinicalApiClient: ApolloClient<NormalizedCacheObject>;
    }
  | undefined
>(undefined);

export const ClinicalApiProvider = (props: { children: any; photonClient: PhotonClient }) => {
  return (
    <ClinicalApiContext.Provider value={{ clinicalApiClient: apollo(props.photonClient) }}>
      {props.children}
    </ClinicalApiContext.Provider>
  );
};

export const useClinicalApiClient = () => {
  const context = useContext(ClinicalApiContext);
  if (!context?.clinicalApiClient) {
    return stub();
  }
  return useApolloClient(context.clinicalApiClient);
};
