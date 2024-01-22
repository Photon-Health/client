import {
  ApolloClient,
  ApolloQueryResult,
  DocumentNode,
  FetchPolicy,
  FetchResult,
  NormalizedCacheObject
} from '@apollo/client';

export type MakeQueryReturn<T> = ApolloQueryResult<T> & {
  refetch: (variables: object) => Promise<ApolloQueryResult<T>>;
  fetchMore: ({
    after,
    first
  }: {
    after?: string;
    first?: string;
  }) => Promise<ApolloQueryResult<T>>;
};

export async function makeQuery<T = any>(
  apollo: ApolloClient<undefined> | ApolloClient<NormalizedCacheObject>,
  query: DocumentNode,
  variables: object = {},
  fetchPolicy: FetchPolicy = 'network-only'
): Promise<MakeQueryReturn<T>> {
  const result = await apollo.query({
    query,
    variables,
    fetchPolicy
  });

  return {
    ...result,
    refetch: (vars: object) => apollo.query({ query, variables: Object.assign(variables, vars) }),
    fetchMore: ({ after, first }) =>
      apollo.query({
        query,
        variables: Object.assign(variables, { after, first })
      })
  };
}

export type MakeMutationReturnOptions = {
  awaitRefetchQueries: boolean;
  refetchQueries?: {
    query: DocumentNode;
  }[];
  variables: object;
};

export type MakeMutationReturn<T> = (
  options: MakeMutationReturnOptions
) => Promise<FetchResult<undefined | null | T>>;

export function makeMutation<T = any>(
  apollo: ApolloClient<undefined> | ApolloClient<NormalizedCacheObject>,
  mutation: DocumentNode
): MakeMutationReturn<T> {
  return ({
    variables,
    refetchQueries,
    awaitRefetchQueries = false
  }: {
    variables: object;
    refetchQueries?: { query: DocumentNode }[];
    awaitRefetchQueries: boolean;
  }) => {
    return apollo.mutate<T>({
      mutation,
      refetchQueries,
      awaitRefetchQueries,
      variables
    });
  };
}

export type Env = 'photon' | 'neutron' | 'boson' | 'tau';

export const clinicalAppUrl: { [key in Env]: string } = {
  tau: 'https://app.boson.health',
  boson: 'https://app.boson.health',
  neutron: 'https://app.neutron.health',
  photon: 'https://app.photon.health'
};

export const lambdasApiUrl: { [key in Env]: string } = {
  tau: 'https://api.boson.health',
  boson: 'https://api.boson.health',
  neutron: 'https://api.neutron.health',
  photon: 'https://api.photon.health'
};

export const clinicalApiUrl: { [key in Env]: string } = {
  tau: 'http://clinical-api.tau.health:8080',
  boson: 'https://clinical-api.boson.health',
  neutron: 'https://clinical-api.neutron.health',
  photon: 'https://clinical-api.photon.health'
};

export function getClinicalUrl(uri: string): string | undefined {
  const foundService = Object.keys(clinicalAppUrl).find((service) =>
    uri.toLowerCase().includes(service)
  ) as Env | undefined;

  return clinicalAppUrl[foundService || 'photon'];
}
