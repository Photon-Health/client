import { analyticsApiUrl, Env, getAuthHeaders } from '../utils';
import { ApiObject } from '@rudderstack/analytics-js';

export class AnalyticsClient {
  private env: Env;
  private isNonProduction: boolean;
  private apiUrl: string;
  private token?: string;
  private sdkVersion?: string;
  private elementsVersion?: string;
  private getToken: () => Promise<string | undefined>;

  constructor({
    env,
    sdkVersion,
    elementsVersion,
    getToken
  }: {
    env: Env;
    sdkVersion?: string;
    elementsVersion?: string;
    getToken: () => Promise<string | undefined>;
  }) {
    this.env = env;
    this.isNonProduction = env === 'boson' || env === 'neutron' || env === 'tau';
    this.apiUrl = analyticsApiUrl[env];
    this.sdkVersion = sdkVersion;
    this.elementsVersion = elementsVersion;
    this.getToken = getToken;
  }

  async track(body: { event: string; userId: string; properties: ApiObject }) {
    if (!this.token) {
      this.token = await this.getToken();
      if (!this.token) {
        // Log error but ultimately okay if this method fails
        console.error('No token found for auth headers');
        return;
      }
    }

    const enrichedBody = {
      ...body,
      properties: {
        ...body.properties,
        environment: this.env,
        sdkVersion: this.sdkVersion,
        elementsVersion: this.elementsVersion
      }
    };
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeaders({ token: this.token, isServices: true })
    };

    if (this.isNonProduction) {
      console.log(`📊 [Analytics: To Analytics API] ${body.event}`, enrichedBody.properties);
    }

    try {
      await fetch(`${this.apiUrl}/event`, {
        method: 'POST',
        body: JSON.stringify(enrichedBody),
        headers: headers
      });
    } catch (e) {
      // If request fails, do not throw error but do log
      console.error('📊 [Analytics: To Analytics API] Error tracking event', e);
    }
  }
}
