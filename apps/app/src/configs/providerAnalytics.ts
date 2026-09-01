import { ApiObject, IdentifyTraits, RudderAnalytics } from '@rudderstack/analytics-js';
import mixpanel from 'mixpanel-browser';

import { FEATURE_FLAG_DEFAULTS, FlagKeys } from './featureFlags';

const RUDDERSTACK_WRITE_KEY = import.meta.env.VITE_RUDDERSTACK_WRITE_KEY;
const RUDDERSTACK_DATA_PLANE_URL = import.meta.env.VITE_RUDDERSTACK_DATA_PLANE_URL;
const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN;
const ENVIRONMENT = import.meta.env.VITE_ENV_NAME || 'development';

export class ProviderAnalytics {
  private rudderanalytics?: RudderAnalytics;
  private environment: string;
  private isInitialized = false;
  private mixpanelEnabled = false;
  private isNonProduction: boolean;

  constructor() {
    this.environment = ENVIRONMENT;
    this.isNonProduction =
      ENVIRONMENT === 'boson' ||
      ENVIRONMENT === 'neutron' ||
      ENVIRONMENT === 'tau' ||
      ENVIRONMENT === 'local' ||
      ENVIRONMENT === 'development';

    if (!RUDDERSTACK_WRITE_KEY || !RUDDERSTACK_DATA_PLANE_URL) {
      console.warn(
        'RudderStack write key and data plane URL are required for analytics. Analytics will be disabled.'
      );
    } else {
      this.rudderanalytics = new RudderAnalytics();
      this.rudderanalytics.load(RUDDERSTACK_WRITE_KEY, RUDDERSTACK_DATA_PLANE_URL);
      this.isInitialized = true;
    }

    if (MIXPANEL_TOKEN) {
      mixpanel.init(MIXPANEL_TOKEN, {
        debug: false, // floods the console, only turn on when needed
        track_pageview: true,
        persistence: 'localStorage',
        record_sessions_percent: 100, // session replay
        record_heatmap_data: true,
        flags: true,
        record_mask_all_text: false, // reveal all text and mask individually; inputs are unaffected and remain masked
        autocapture: false
      });
      this.mixpanelEnabled = true;
    }
  }

  /**
   * Identify the current user so all subsequent events are attributed to them.
   */
  identify(userId: string, traits: IdentifyTraits = {}) {
    if (this.rudderanalytics && this.isInitialized) {
      this.rudderanalytics.identify(userId, traits);
    }
    if (this.mixpanelEnabled) {
      mixpanel.identify(userId);
    }
  }

  /**
   * Check a Mixpanel feature flag. Resolves to the flag's default from
   * `FEATURE_FLAG_DEFAULTS` when Mixpanel is not configured or the lookup
   * fails.
   */
  async isFeatureEnabled(flagName: FlagKeys): Promise<boolean> {
    const fallbackValue = FEATURE_FLAG_DEFAULTS[flagName];
    if (!this.mixpanelEnabled) {
      return fallbackValue;
    }
    try {
      return await mixpanel.flags.is_enabled(flagName, fallbackValue);
    } catch {
      return fallbackValue;
    }
  }

  /**
   * Track a user event (e.g., button click, form submission)
   * @param eventName - Name of the event (e.g., 'Button Clicked', 'Form Submitted')
   * @param properties - Event properties including context data
   */
  track(eventName: string, properties: ApiObject = {}) {
    const trackProperties = {
      environment: this.environment,
      ...properties
    };

    if (this.rudderanalytics && this.isInitialized) {
      if (this.isNonProduction) {
        console.log(`📊 [Analytics: To Rudderstack] ${eventName}`, trackProperties);
      }
      this.rudderanalytics.track(eventName, trackProperties);
    } else if (this.mixpanelEnabled) {
      // using else to prevent double tracking, since Rudderstack events are forwarded to Mixpanel
      if (this.isNonProduction) {
        console.log(`📊 [Analytics: To Mixpanel] ${eventName}`, trackProperties);
      }
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
