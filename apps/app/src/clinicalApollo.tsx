import { ApolloClient, NormalizedCacheObject, useApolloClient } from '@apollo/client';
import { createContext, ReactNode, useContext } from 'react';

const stub = (): never => {
  throw new Error('You forgot to wrap your component in <ClinicalApiProvider>.');
};

const ClinicalApiContext = createContext<
  | {
      clinicalApiClient: ApolloClient<NormalizedCacheObject> | ApolloClient<undefined>;
    }
  | undefined
>(undefined);

export const ClinicalApiProvider = (props: {
  children: ReactNode | ReactNode[];
  apolloClient: ApolloClient<NormalizedCacheObject> | ApolloClient<undefined>;
}) => {
  return (
    <ClinicalApiContext.Provider value={{ clinicalApiClient: props.apolloClient }}>
      {props.children}
    </ClinicalApiContext.Provider>
  );
};

export const useClinicalApiClient = () => {
  const context = useContext(ClinicalApiContext);
  if (!context?.clinicalApiClient) {
    return stub();
  }
  console.log('context.clinicalApiClient', context.clinicalApiClient);
  return useApolloClient(context.clinicalApiClient);
};
