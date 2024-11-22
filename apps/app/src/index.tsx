import { createRoot } from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';

import { datadogRum } from '@datadog/browser-rum';

import reportWebVitals from './reportWebVitals';
import * as serviceWorker from './serviceWorker';

import theme from './configs/theme';
import { App } from './App';

import pkg from '../package.json';
import '@photonhealth/elements';

datadogRum.init({
  applicationId: process.env.REACT_APP_DATADOG_RUM_APPLICATION_ID as string,
  clientToken: process.env.REACT_APP_DATADOG_RUM_CLIENT_TOKEN as string,
  site: 'datadoghq.com',
  service: pkg.name,
  env: process.env.REACT_APP_ENV_NAME,
  version: __COMMIT_HASH__,
  sessionSampleRate: 100,
  sessionReplaySampleRate: 100,
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true,
  defaultPrivacyLevel: 'mask-user-input'
});

datadogRum.startSessionReplayRecording();

const container = document.getElementById('root')!;
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(
  <ChakraProvider theme={theme}>
    <App />
  </ChakraProvider>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorker.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
