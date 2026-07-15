import { analyticsApiUrl, Env, ServicesAuthHeaders } from '../utils';
import { ApiObject } from '@rudderstack/analytics-js';

export class AnalyticsClient {
  private apiUrl: string;
  private getAuthHeaders: () => Promise<ServicesAuthHeaders>;
  private authHeaders?: ServicesAuthHeaders;

  constructor({
    env,
    getAuthHeaders
  }: {
    env: Env;
    getAuthHeaders: () => Promise<ServicesAuthHeaders>;
  }) {
    this.apiUrl = analyticsApiUrl[env];
    this.getAuthHeaders = getAuthHeaders;
  }

  async track(body: { event: string; userId: string; properties: ApiObject }) {
    if (!this.authHeaders) {
      this.authHeaders = await this.getAuthHeaders();
      if (!this.authHeaders) {
        // Log error but ultimately okay if this method fails
        console.error('No token found for auth headers');
        return;
      }
    }

    try {
      await fetch(`${this.apiUrl}/event`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          ...this.authHeaders
        }
      });
    } catch (e) {
      // Log error but ultimately okay if this method fails
      console.error(e);
    }
  }
}
