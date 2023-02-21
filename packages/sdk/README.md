# `@photonhealth/sdk`

> Photon JavaScript SDK

## Installation

```
npm install @photonhealth/sdk
```

## Usage

```
import { PhotonClient } from "@photonhealth/sdk";

const client = new PhotonClient({
  domain: "auth.photon.health",
  clientId: "YOUR_CLIENT_ID",
  redirectURI: window.location.origin,
  organization: "YOUR_ORG_ID"
});
```
