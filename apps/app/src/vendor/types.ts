import type { datadogRum } from '@datadog/browser-rum';

declare global {
  interface Window {
    DD_RUM: typeof datadogRum;
  }
}

export {};
