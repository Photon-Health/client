import { createRoot } from 'react-dom/client';

import reportWebVitals from './reportWebVitals';
import { App } from './App';

import { datadogRum } from '@datadog/browser-rum';

import pkg from '../package.json';

datadogRum.init({
  applicationId: process.env.REACT_APP_DATADOG_RUM_APPLICATION_ID as string,
  clientToken: process.env.REACT_APP_DATADOG_RUM_CLIENT_TOKEN as string,
  site: 'datadoghq.com',
  service: pkg.name,
  env: process.env.REACT_APP_ENV_NAME,
  version: pkg.version,
  sampleRate: 100,
  sessionReplaySampleRate: 100,
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true
});

datadogRum.startSessionReplayRecording();

const root = createRoot(document.getElementById('root'));
root.render(<App />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
