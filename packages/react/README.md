# `@photonhealth/react`

> React integration for the Photon JavaScript SDK

## Installation

```
npm install @photonhealth/react
```

## Usage

```
import React from 'react';
import ReactDOM from 'react-dom';
import { PhotonClient, PhotonProvider } from "@photonhealth/react";

const client = new PhotonClient({
  domain: "auth.photon.health",
  clientId: "YOUR_CLIENT_ID",
  redirectURI: window.location.origin,
  organization: "YOUR_ORG_ID"
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <PhotonProvider client={client}>
    <App />
  </PhotonProvider>
);
```
