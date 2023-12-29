// import { Auth0ProviderOptions } from '@auth0/auth0-react';

export const auth0Config = {
  domain: process.env.REACT_APP_AUTH0_DOMAIN as string,
  clientId: process.env.REACT_APP_AUTH0_CLIENT_ID as string,
  audience: process.env.REACT_APP_AUTH0_AUDIENCE as string,
  useRefreshTokens: true,
  redirectUri: window.location.origin
};
