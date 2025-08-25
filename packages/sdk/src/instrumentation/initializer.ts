import type { RumInitConfiguration } from '@datadog/browser-rum-core';
import { datadogRum } from '@datadog/browser-rum';
import { getClinicalDatadogAppId, getEmbedDatadogConfig } from './config';
import { embedDatadogBeforeSendHandler } from './beforeSend';

export function initializeEmbedDatadogRUM(config: {
  env?: string;
  version?: string;
  allowedResourceUrls: string[];
  organizationId?: string;
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
    // important to use the imported datadogRum, not the global,
    // in case customers are using datadog in the app where the photon SDK is embedded
    datadogRum.init(rumConfig);
    datadogRum.setGlobalContextProperty('org', { orgId: config.organizationId });
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

declare global {
  interface Window {
    DD_RUM: typeof datadogRum;
  }
}
