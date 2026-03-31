import { ApiObject, RudderAnalytics } from '@rudderstack/analytics-js';
import { defaults } from 'lodash';
import mixpanel from 'mixpanel-browser';

const RUDDERSTACK_WRITE_KEY = import.meta.env.VITE_RUDDERSTACK_WRITE_KEY;
const RUDDERSTACK_DATA_PLANE_URL = import.meta.env.VITE_RUDDERSTACK_DATA_PLANE_URL;
const ENVIRONMENT = import.meta.env.VITE_ENV_NAME || 'development';
const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN;

export class ProviderAnalytics {
  private rudderanalytics?: RudderAnalytics;
  private environment: string;
  private rudderstackEnabled = false;
  private mixpanelEnabled: boolean = false;

  constructor() {
    this.environment = ENVIRONMENT;

    if (RUDDERSTACK_WRITE_KEY && RUDDERSTACK_DATA_PLANE_URL) {
      this.rudderanalytics = new RudderAnalytics();
      this.rudderanalytics.load(RUDDERSTACK_WRITE_KEY, RUDDERSTACK_DATA_PLANE_URL);
      this.rudderstackEnabled = true;
    } else {
      console.error('RudderStack write key and data plane URL are required');
    }

    if (MIXPANEL_TOKEN) {
      mixpanel.init(MIXPANEL_TOKEN, {
        debug: false,
        track_pageview: true,
        persistence: 'localStorage',
        record_sessions_percent: 100,
        record_heatmap_data: true
      });
      this.mixpanelEnabled = true;
    }
  }

  identify(userId: string) {
    if (this.mixpanelEnabled) {
      mixpanel.identify(userId);
    }
  }

  /**
   * Track a user event (e.g., button click, form submission)
   * @param eventName - Name of the event (e.g., 'Button Clicked', 'Form Submitted')
   * @param properties - Event properties including context data
   */
  track(
    eventName: string,
    properties: ApiObject = {},
    options: { toRudderStack?: boolean; toMixpanel?: boolean } = {}
  ) {
    // Rudderstack is our existing metrics tool so default to true
    // Mixpanel is new and we don't want to send everything there yet, default to false
    defaults(options, { toRudderStack: true, toMixpanel: false });

    const trackProperties = {
      environment: this.environment,
      ...properties
    };

    if (this.rudderanalytics && this.rudderstackEnabled && options.toRudderStack) {
      this.rudderanalytics.track(eventName, trackProperties);
    }

    if (this.mixpanelEnabled && options.toMixpanel) {
      mixpanel.track(eventName, trackProperties);
    }
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
