# `@photonhealth/sdk`

> Photon JavaScript SDK

## Installation

```
npm install @photonhealth/sdk
```

## Usage

```ts
import { PhotonClient } from '@photonhealth/sdk';

const client = new PhotonClient({
  clientId: YOUR_CLIENT_ID,
  organization: YOUR_ORG_ID,
  developmentMode: !IS_PRODUCTION,
  redirectURI: window.location.origin
});
```

If you're using the SDK in conjunction with the Photon Elements, you might want to determine a user's auth status in React:

```ts
const [result] = useAsyncEffect(async () => {
  const client = new PhotonClient({
    clientId: YOUR_CLIENT_ID,
    organization: YOUR_ORG_ID,
    developmentMode: !IS_PRODUCTION,
    redirectURI: window.location.origin
  });

  const auth = client.authentication;

  return {
    isAuthenticated: await auth.isAuthenticated(),
    photonClient: client
  };
}, []);

return result.isAuthenticated
  ? // if logged in
  : // else...
```
