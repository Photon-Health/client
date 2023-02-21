import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ChakraProvider } from "@chakra-ui/react";
import { PhotonClient, PhotonProvider } from "@photonhealth/react";

const client = new PhotonClient({
  domain: process.env.REACT_APP_DOMAIN,
  clientId: process.env.REACT_APP_CLIENT_ID,
  redirectURI: window.location.origin,
  audience: "https://api.boson.health",
  uri: "https://api.boson.health/graphql",
  organization: "org_KzSVZBQixLRkqj5d"
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ChakraProvider>
    <PhotonProvider client={client}>
      <App />
    </PhotonProvider>
  </ChakraProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
