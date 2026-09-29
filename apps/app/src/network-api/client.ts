import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { print } from 'graphql';
import { RequestMetadata, RequestSource } from './gql/graphql';

// network-api is only deployed to boson/tau for now
const networkApiUrlByEnv: Record<string, string> = {
  boson: 'http://network-api.boson.health/graphql',
  tau: 'http://network-api.tau.health/graphql'
};

export const getNetworkApiUrl = (): string | undefined =>
  networkApiUrlByEnv[import.meta.env.VITE_ENV_NAME as string];

export const buildRequestMetadata = (): RequestMetadata => ({
  source: RequestSource.WebApp,
  client: 'photon-clinical-app',
  requestId: crypto.randomUUID()
});

export class NetworkApiError extends Error {}

export async function networkApiRequest<TData, TVariables>(
  document: TypedDocumentNode<TData, TVariables>,
  variables: TVariables,
  token: string
): Promise<TData> {
  const url = getNetworkApiUrl();
  if (!url) {
    throw new NetworkApiError(
      `network-api is not available in the ${import.meta.env.VITE_ENV_NAME} environment`
    );
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // network-api's CORS config only allows these two headers — don't add
      // x-photon-auth-token-type here or the browser preflight fails
      'x-photon-auth-token': token
    },
    body: JSON.stringify({ query: print(document), variables })
  });

  const body = await response.json().catch(() => undefined);
  if (body?.errors?.length) {
    throw new NetworkApiError(body.errors.map((e: { message: string }) => e.message).join('; '));
  }
  if (!response.ok || !body?.data) {
    throw new NetworkApiError(`network-api request failed with status ${response.status}`);
  }
  return body.data as TData;
}
