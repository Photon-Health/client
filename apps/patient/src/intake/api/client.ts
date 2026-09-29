const PROXY_PATH = import.meta.env.VITE_INTAKE_API_PROXY_PATH as string | undefined;
const ENDPOINT = import.meta.env.VITE_NETWORK_API_ENDPOINT as string | undefined;
const MACHINE_TOKEN = import.meta.env.VITE_INTAKE_MACHINE_TOKEN as string | undefined;

export const REQUEST_METADATA = { source: 'WEB_APP', client: 'patient-intake' };

export class IntakeApiError extends Error {}

/**
 * Talks to network-api as a MACHINE principal (M2M token carrying the MASTER
 * org claim). When VITE_INTAKE_API_PROXY_PATH is set the token is held by the
 * proxy and never reaches the bundle; otherwise it is read from env directly.
 */
export async function networkApi<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const url = PROXY_PATH ?? ENDPOINT;
  if (!url) {
    throw new IntakeApiError(
      'Set VITE_INTAKE_API_PROXY_PATH or VITE_NETWORK_API_ENDPOINT to use the intake flow.'
    );
  }

  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (!PROXY_PATH) {
    if (!MACHINE_TOKEN) {
      throw new IntakeApiError('VITE_INTAKE_MACHINE_TOKEN is required without a proxy.');
    }
    headers['x-photon-auth-token'] = MACHINE_TOKEN;
    // headers['x-photon-auth-token-type'] = 'auth0-m2m';
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables })
  });

  if (!response.ok) {
    throw new IntakeApiError(`network-api returned ${response.status}`);
  }

  const body = await response.json();
  if (body.errors?.length) {
    throw new IntakeApiError(body.errors[0].message ?? 'network-api request failed');
  }
  return body.data as T;
}
