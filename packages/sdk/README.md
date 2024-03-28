# `@photonhealth/sdk`

> Photon JavaScript SDK

## Installation

```
npm install @photonhealth/sdk
```

## Usage

```ts
import { PhotonClient } from '@photonhealth/sdk';

// Create a new instance of the SDK
const client = new PhotonClient({
  clientId: YOUR_CLIENT_ID,
  organization: YOUR_ORG_ID,
  developmentMode: !IS_PRODUCTION,
  redirectURI: window.location.origin
});

// Check if a user is currently authenticated
const isAuthenticated = await client.authentication.isAuthenticated();
```
