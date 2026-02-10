import { clinicalApiUrl, Env } from 'packages/sdk/src/utils';

/**
 * Tracks an analytics event by sending it to the auth0/track-event endpoint
 * @param event - The event name to track
 * @param properties - Additional properties to include with the event
 * @param sessionToken - The session token for authentication (optional)
 * @returns Promise that resolves when the tracking request completes
 */
export async function trackSelfSignupEvent(
  event: string,
  properties: Record<string, unknown> = {},
  sessionToken?: string
): Promise<void> {
  const environment = (process.env.REACT_APP_ENV_NAME || 'photon') as Env;
  const baseUrl = clinicalApiUrl[environment];
  const url = `${baseUrl}/auth0/track-event`;

  const propertiesWithEnv = {
    ...properties,
    environment
  };
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event,
        properties: propertiesWithEnv,
        sessionToken
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to track analytics event:', {
        event,
        status: response.status,
        error: errorData
      });
    }
  } catch (error) {
    console.error('Error tracking analytics event:', {
      event,
      error
    });
  }
}
