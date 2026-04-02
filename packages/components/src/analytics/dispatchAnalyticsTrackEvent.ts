import type { AnalyticsCategory, AnalyticsEventMap } from '@photonhealth/sdk';

type AnalyticsRef = { dispatchEvent(event: CustomEvent): void };

export const dispatchAnalyticsTrackEvent = <C extends AnalyticsCategory>(
  category: C,
  event: AnalyticsEventMap[C],
  ref: AnalyticsRef
) => {
  const customEvent = new CustomEvent('photon-analytics-track-event', {
    composed: true,
    bubbles: true,
    detail: { ...event, category, timestamp: new Date().toISOString() }
  });
  ref?.dispatchEvent(customEvent);
};
