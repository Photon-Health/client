import { datadogRum } from '@datadog/browser-rum';
import mixpanel from 'mixpanel-browser';
import { beforeSendHandler } from './beforeSendHandler';
import pkg from '../../package.json';

export const initializeInstrumentation = () => {
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
    defaultPrivacyLevel: 'mask-user-input',
    beforeSend: beforeSendHandler
  });

  datadogRum.startSessionReplayRecording();

  const mixpanelToken = process.env.REACT_APP_MIXPANEL_PROJECT_TOKEN;
  if (mixpanelToken) {
    mixpanel.init(mixpanelToken, {
      debug: true,
      autocapture: {
        pageview: 'full-url',
        click: true,
        dead_click: true,
        input: true,
        rage_click: true,
        scroll: true,
        submit: true,
        capture_text_content: false
      }
    });
  }
};
