import { ApiObject, RudderAnalytics } from '@rudderstack/analytics-js';

const RUDDERSTACK_WRITE_KEY = process.env.REACT_APP_RUDDERSTACK_WRITE_KEY;
const RUDDERSTACK_DATA_PLANE_URL = process.env.REACT_APP_RUDDERSTACK_DATA_PLANE_URL;
const ENVIRONMENT = process.env.REACT_APP_ENV_NAME || 'development';

export class ProviderAnalytics {
  private rudderanalytics?: RudderAnalytics;
  private environment: string;
  private isInitialized = false;

  constructor() {
    this.environment = ENVIRONMENT;

    if (!RUDDERSTACK_WRITE_KEY || !RUDDERSTACK_DATA_PLANE_URL) {
      console.warn(
        'RudderStack write key and data plane URL are required for analytics. Analytics will be disabled.'
      );
      return;
    }

    this.rudderanalytics = new RudderAnalytics();
    this.rudderanalytics.load(RUDDERSTACK_WRITE_KEY, RUDDERSTACK_DATA_PLANE_URL);
    this.isInitialized = true;
  }

  /**
   * Track a user event (e.g., button click, form submission)
   * @param eventName - Name of the event (e.g., 'Button Clicked', 'Form Submitted')
   * @param properties - Event properties including context data
   */
  track(eventName: string, properties: ApiObject = {}) {
    if (!this.rudderanalytics || !this.isInitialized) {
      return;
    }

    const trackProperties = {
      environment: this.environment,
      ...properties
    };

    this.rudderanalytics.track(eventName, trackProperties);
  }
}

// Lazy singleton instance - only instantiates when first accessed
// to fix /sso redirect page from throwing many Rudderstack errors on page load
let _providerAnalytics: ProviderAnalytics | undefined;

export function getProviderAnalytics(): ProviderAnalytics {
  if (!_providerAnalytics) {
    _providerAnalytics = new ProviderAnalytics();
  }
  return _providerAnalytics;
}
