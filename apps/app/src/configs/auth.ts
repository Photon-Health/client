export const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN as string,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID as string,
  audience: import.meta.env.VITE_AUTH0_AUDIENCE as string,
  useRefreshTokens: true,
  redirectUri: window.location.origin
};

// Domain of the Photon auth API that owns the account-linking flow
// (see services/apps/auth-api/src/link-flow.ts).
// TODO: source this from a VITE_AUTH_API_DOMAIN env var per environment.
export const authApiDomain = 'auth-api.boson.health';
