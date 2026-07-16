import { analyticsApiUrl, Env, getAuthHeaders, getVersionHeaders } from '../utils';
import { ApiObject } from '@rudderstack/analytics-js';

export class AnalyticsClient {
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

    try {
      await fetch(`${this.apiUrl}/event`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders({ token: this.token, isServices: true }),
          ...getVersionHeaders({
            sdkVersion: this.sdkVersion,
            elementsVersion: this.elementsVersion
          })
        }
      });
    } catch (e) {
      // Log error but ultimately okay if this method fails
      console.error(e);
    }
  }
}
