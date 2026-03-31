import type { CtaClickEvent, FieldInteractionEvent, PageViewEvent } from '@photonhealth/sdk';

type AnalyticsRef = { dispatchEvent(event: CustomEvent): void };

function dispatch(category: string, event: Record<string, unknown>, ref: AnalyticsRef) {
  const customEvent = new CustomEvent('photon-analytics-track-event', {
    composed: true,
    bubbles: true,
    detail: { ...event, category, timestamp: new Date().toISOString() }
  });
  ref?.dispatchEvent(customEvent);
}

export const dispatchPageViewAnalyticsEvent = (event: PageViewEvent, ref: AnalyticsRef) =>
  dispatch('pageViewed', event as unknown as Record<string, unknown>, ref);

export const dispatchCtaAnalyticsEvent = (event: CtaClickEvent, ref: AnalyticsRef) =>
  dispatch('ctaClicked', event as unknown as Record<string, unknown>, ref);

export const dispatchFieldInteractionAnalyticsEvent = (
  event: FieldInteractionEvent,
  ref: AnalyticsRef
) => dispatch('fieldInteraction', event as unknown as Record<string, unknown>, ref);
