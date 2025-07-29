import { RudderAnalytics } from '@rudderstack/analytics-js';

const RUDDERSTACK_WRITE_KEY = process.env.REACT_APP_RUDDERSTACK_WRITE_KEY;
const RUDDERSTACK_DATA_PLANE_URL = process.env.REACT_APP_RUDDERSTACK_DATA_PLANE_URL;
const ENVIRONMENT = process.env.REACT_APP_ENV_NAME || 'development';

export class PatientAnalytics {
  private analytics: RudderAnalytics;
  private environment = 'development';

  constructor() {
    if (!RUDDERSTACK_WRITE_KEY || !RUDDERSTACK_DATA_PLANE_URL) {
      throw new Error('RudderStack write key and data plane URL are required');
    }

    this.analytics = new RudderAnalytics();
    this.analytics.load(RUDDERSTACK_WRITE_KEY || '', RUDDERSTACK_DATA_PLANE_URL || '');
    this.environment = ENVIRONMENT;
  }
}

export const patientAnalytics = new PatientAnalytics();
