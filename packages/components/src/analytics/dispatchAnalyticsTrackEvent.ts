import type { PhotonEmbedAnalyticsEventInput } from '@photonhealth/sdk';

export const dispatchAnalyticsTrackEvent = (
  detail: PhotonEmbedAnalyticsEventInput,
  ref: { dispatchEvent(event: CustomEvent): void }
) => {
  const event = new CustomEvent('photon-analytics-track-event', {
    composed: true,
    bubbles: true,
    detail: { ...detail, timestamp: new Date().toISOString() }
  });
  ref?.dispatchEvent(event);
};
