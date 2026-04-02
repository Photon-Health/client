import type {
  AnalyticsCategory,
  CtaClickEvent,
  FieldInteractionEvent,
  PageViewEvent
} from '@photonhealth/sdk';

type AnalyticsRef = { dispatchEvent(event: CustomEvent): void };

type AnalyticsEventMap = {
  pageViewed: PageViewEvent;
  ctaClicked: CtaClickEvent;
  fieldInteraction: FieldInteractionEvent;
};

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
