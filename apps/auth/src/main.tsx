import React, { createContext } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import { Auth0Provider } from '@auth0/auth0-react';
import { linkContext } from './context';

import('@photonhealth/elements').catch(() => {});

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'photon-client': unknown;
      'photon-multirx-form-wrapper': unknown;
    }
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Photon Test FE on Neutron */}
    <Auth0Provider
      domain="neutrons.us.auth0.com"
      clientId="L1RZwrRzOUqRcdRcVIqsviWbfLyiMBHc"
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
      skipRedirectCallback={window.location.href.includes('photon=true')}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);
