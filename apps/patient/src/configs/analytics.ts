import { ApiObject, RudderAnalytics } from '@rudderstack/analytics-js';

const RUDDERSTACK_WRITE_KEY = process.env.REACT_APP_RUDDERSTACK_WRITE_KEY;
const RUDDERSTACK_DATA_PLANE_URL = process.env.REACT_APP_RUDDERSTACK_DATA_PLANE_URL;
const ENVIRONMENT = process.env.REACT_APP_ENV_NAME || 'development';

export class PatientAnalytics {
  private rudderanalytics: RudderAnalytics;
  private environment = 'development';

  constructor() {
    if (!RUDDERSTACK_WRITE_KEY || !RUDDERSTACK_DATA_PLANE_URL) {
      throw new Error('RudderStack write key and data plane URL are required');
    }

    this.rudderanalytics = new RudderAnalytics();
    this.rudderanalytics.load(RUDDERSTACK_WRITE_KEY || '', RUDDERSTACK_DATA_PLANE_URL || '');
    this.environment = ENVIRONMENT;
  }

  page(category: string, name?: string, properties: ApiObject = {}) {
    if (!this.rudderanalytics) {
      return;
    }

    const pageProperties = {
      environment: this.environment,
      ...properties
    };

    if (name) {
      this.rudderanalytics.page(category, name, pageProperties);
    } else {
      this.rudderanalytics.page(category, pageProperties);
    }
  }
}

export const patientAnalytics = new PatientAnalytics();
