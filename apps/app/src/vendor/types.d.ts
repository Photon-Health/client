import { datadogRum } from '@datadog/browser-rum';

// we want to use the global DD_RUM instance rather than the import
// because the context is then accessible within the Clinical Embed Web Component
declare global {
  interface Window {
    DD_RUM: typeof datadogRum;
  }
}

export {};
