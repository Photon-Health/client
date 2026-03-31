import { describe, it, expect, vi } from 'vitest';
import {
  dispatchPageViewAnalyticsEvent,
  dispatchCtaAnalyticsEvent,
  dispatchFieldInteractionAnalyticsEvent
} from '@photonhealth/components';

function createMockRef() {
  const events: CustomEvent[] = [];
  return {
    dispatchEvent: vi.fn((event: CustomEvent) => events.push(event)),
    events
  };
}

describe('prescribe form analytics dispatch', () => {
  it('emits a page view event with the correct shape', () => {
    const ref = createMockRef();

    dispatchPageViewAnalyticsEvent(
      {
        name: 'New Prescriptions Page Viewed',
        prefillPatientId: 'pat_123',
        prefillPharmacyId: '',
        hasPrefillPatientExternalId: false,
        hasPrefillTemplateIds: false,
        hasPrefillPrescriptionIds: false,
        hasPrefillWeight: false,
        weightUnit: 'lbs'
      },
      ref
    );

    expect(ref.dispatchEvent).toHaveBeenCalledOnce();
    const event = ref.events[0];
    expect(event.type).toBe('photon-analytics-track-event');
    expect(event.composed).toBe(true);
    expect(event.bubbles).toBe(true);
    expect(event.detail).toEqual(
      expect.objectContaining({
        category: 'pageViewed',
        name: 'New Prescriptions Page Viewed',
        prefillPatientId: 'pat_123',
        weightUnit: 'lbs'
      })
    );
    expect(event.detail.timestamp).toBeDefined();
  });

  it('emits a major CTA event with buttonText', () => {
    const ref = createMockRef();

    dispatchCtaAnalyticsEvent(
      {
        name: 'Order Sent',
        buttonText: 'Send',
        orderId: 'ord_abc',
        prescriptionCount: 2,
        fulfillmentType: 'PICK_UP',
        hasPreferredPharmacy: true,
        setAsPreferred: false,
        pharmacyId: 'phar_456',
        isCombinedOrder: false
      },
      ref
    );

    expect(ref.dispatchEvent).toHaveBeenCalledOnce();
    const detail = ref.events[0].detail;
    expect(detail).toEqual(
      expect.objectContaining({
        category: 'ctaClicked',
        name: 'Order Sent',
        buttonText: 'Send',
        orderId: 'ord_abc',
        prescriptionCount: 2,
        fulfillmentType: 'PICK_UP',
        pharmacyId: 'phar_456',
        isCombinedOrder: false
      })
    );
  });

  it('emits a minor CTA event with ctaName', () => {
    const ref = createMockRef();

    dispatchCtaAnalyticsEvent(
      {
        name: 'Minor CTA Clicked',
        ctaName: 'draft prescription added',
        draftPrescriptionSource: 'form',
        fields: { treatment: { completed: true }, instructions: { completed: false } }
      },
      ref
    );

    expect(ref.dispatchEvent).toHaveBeenCalledOnce();
    const detail = ref.events[0].detail;
    expect(detail).toEqual(
      expect.objectContaining({
        category: 'ctaClicked',
        name: 'Minor CTA Clicked',
        ctaName: 'draft prescription added',
        draftPrescriptionSource: 'form',
        fields: {
          treatment: { completed: true },
          instructions: { completed: false }
        }
      })
    );
  });

  it('emits a field interaction event with formName and isOptional', () => {
    const ref = createMockRef();

    dispatchFieldInteractionAnalyticsEvent(
      {
        name: 'Field Interaction',
        formName: 'add_prescription_form',
        fieldName: 'treatment',
        hasValue: true,
        isOptional: false
      },
      ref
    );

    expect(ref.dispatchEvent).toHaveBeenCalledOnce();
    const detail = ref.events[0].detail;
    expect(detail).toEqual(
      expect.objectContaining({
        category: 'fieldInteraction',
        name: 'Field Interaction',
        formName: 'add_prescription_form',
        fieldName: 'treatment',
        hasValue: true,
        isOptional: false
      })
    );
  });
});
