import { createRoot } from 'react-dom/client';

import { App } from './App';

import { datadogRum } from '@datadog/browser-rum';

import ReactGA from 'react-ga4';

import pkg from '../package.json';

import mixpanel from 'mixpanel-browser';

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

const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN;

if (MIXPANEL_TOKEN) {
  mixpanel.init(MIXPANEL_TOKEN, {
    track_pageview: true,
    persistence: 'localStorage',
    record_sessions_percent: 100, // session replay
    record_heatmap_data: true
  });
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
