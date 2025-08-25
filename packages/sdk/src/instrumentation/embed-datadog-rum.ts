import { datadogRum } from '@datadog/browser-rum';
import { getClinicalDatadogAppId, getEmbedDatadogConfig } from './embed-datadog-config';
import type { RumInitConfiguration } from '@datadog/browser-rum-core';
import { embedDatadogBeforeSendHandler } from './beforeSend';

export function initializeEmbedDatadogRUM(config: {
  env?: string;
  version?: string;
  allowedResourceUrls: string[];
}): void {
  if (isClinicalPhotonAppAlreadyConfigured()) return;

  const { applicationId, clientToken } = getEmbedDatadogConfig();
  const rumConfig: RumInitConfiguration = {
    applicationId,
    clientToken,
    site: 'datadoghq.com',
    service: 'photon-embed',
    env: config.env,
    version: config.version,
    sessionSampleRate: 100,
    sessionReplaySampleRate: 0,
    trackUserInteractions: false,
    trackResources: true,
    trackLongTasks: false,
    defaultPrivacyLevel: 'mask-user-input',
    beforeSend: (e, c) => {
      return embedDatadogBeforeSendHandler(e, c, config.allowedResourceUrls);
    }
  };

  try {
    datadogRum.init(rumConfig);
    console.log('Embed Datadog RUM initialized');
  } catch (error) {
    console.warn('Failed to initialize Embed Datadog RUM:', error);
  }
}

function isClinicalPhotonAppAlreadyConfigured(): boolean {
  const globalInitConfiguration = window.DD_RUM.getInitConfiguration();
  const hasExistingGlobalConfig = !!globalInitConfiguration;
  return (
    hasExistingGlobalConfig && globalInitConfiguration.applicationId === getClinicalDatadogAppId()
  );
}
