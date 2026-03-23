import { createRoot } from 'react-dom/client';

import { App } from './App';

import { datadogRum } from '@datadog/browser-rum';

import ReactGA from 'react-ga4';

import pkg from '../package.json';

ReactGA.initialize('G-WQ9PD39S25');

datadogRum.init({
  applicationId: import.meta.env.VITE_DATADOG_RUM_APPLICATION_ID as string,
  clientToken: import.meta.env.VITE_DATADOG_RUM_CLIENT_TOKEN as string,
  site: 'datadoghq.com',
  service: pkg.name,
  env: import.meta.env.VITE_ENV_NAME,
  version: __COMMIT_HASH__,
  sessionSampleRate: 100,
  sessionReplaySampleRate: 100,
  trackUserInteractions: true,
  trackResources: true,
  trackLongTasks: true,
  defaultPrivacyLevel: 'mask-user-input'
});

datadogRum.startSessionReplayRecording();

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
