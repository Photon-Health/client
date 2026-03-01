import { Page } from '@playwright/test';

export const RX_FORM_EVENT = 'clinicalapp_prescription_form_track_events';

/**
 * Intercepts analytics at the JavaScript level by monkey-patching
 * the RudderStack SDK's track method before the app loads.
 * This avoids issues with network-level interception (sendBeacon, CORS, glob matching).
 */
export async function setupAnalyticsCapture(page: Page) {
  await page.addInitScript(() => {
    (window as any).__capturedAnalytics = [];

    // Block RudderStack network requests
    const originalFetch = window.fetch.bind(window);
    window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      if (url.includes('rudderstack')) {
        return Promise.resolve(new Response('{}', { status: 200 }));
      }
      return originalFetch(input, init);
    };

    // Poll for the RudderStack instance and patch its track method
    let patched = false;
    const patchInterval = setInterval(() => {
      const rs = (window as any).rudderanalytics;
      if (rs && typeof rs.track === 'function' && !patched) {
        patched = true;
        const originalTrack = rs.track.bind(rs);
        rs.track = (eventName: string, properties?: Record<string, unknown>) => {
          (window as any).__capturedAnalytics.push({
            event: eventName,
            properties: properties ?? {}
          });
          // Still call original so the app doesn't break — network requests are already blocked
          originalTrack(eventName, properties);
        };
        clearInterval(patchInterval);
      }
    }, 50);
    setTimeout(() => clearInterval(patchInterval), 30_000);
  });
}

export async function getCapturedAnalytics(page: Page) {
  return page.evaluate(
    () =>
      (window as any).__capturedAnalytics as {
        event: string;
        properties: Record<string, unknown>;
      }[]
  );
}
