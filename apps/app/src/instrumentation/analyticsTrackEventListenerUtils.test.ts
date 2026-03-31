import { describe, it, expect, vi } from 'vitest';
import { trackAnalyticsEvent } from './analyticsTrackEventListenerUtils';
import type { PhotonEmbedAnalyticsEventInput } from '@photonhealth/sdk';

function createTrackSpy() {
  const calls: { eventName: string; payload: Record<string, unknown> }[] = [];
  const track = vi.fn((eventName: string, payload: Record<string, unknown>) => {
    calls.push({ eventName, payload });
  });
  return { track, calls };
}

describe('trackAnalyticsEvent', () => {
  it('resolves a page view event to the correct RudderStack event name', () => {
    const { track, calls } = createTrackSpy();

    const detail: PhotonEmbedAnalyticsEventInput = {
      category: 'pageViewed',
      name: 'New Prescriptions Page Viewed',
      prefillPatientId: 'pat_123',
      prefillPharmacyId: '',
      hasPrefillPatientExternalId: false,
      hasPrefillTemplateIds: false,
      hasPrefillPrescriptionIds: false,
      hasPrefillWeight: false,
      weightUnit: 'lbs'
    };

    trackAnalyticsEvent(detail, track);

    expect(track).toHaveBeenCalledOnce();
    expect(calls[0].eventName).toBe('New Prescriptions Page Viewed');
    expect(calls[0].payload).toEqual({
      prefillPatientId: 'pat_123',
      prefillPharmacyId: '',
      hasPrefillPatientExternalId: false,
      hasPrefillTemplateIds: false,
      hasPrefillPrescriptionIds: false,
      hasPrefillWeight: false,
      weightUnit: 'lbs'
    });
  });

  it('resolves a major CTA and flattens field snapshots', () => {
    const { track, calls } = createTrackSpy();

    const detail: PhotonEmbedAnalyticsEventInput = {
      category: 'ctaClicked',
      name: 'Patient Created',
      buttonText: 'Create and Start Prescription',
      patientId: 'pat_456',
      didClickCreatePatientAndPrescription: true,
      fields: {
        firstName: { completed: true },
        lastName: { completed: true },
        dateOfBirth: { completed: true },
        phone: { completed: false }
      }
    };

    trackAnalyticsEvent(detail, track);

    expect(track).toHaveBeenCalledOnce();
    expect(calls[0].eventName).toBe('Patient Created');
    expect(calls[0].payload).toEqual({
      buttonText: 'Create and Start Prescription',
      patientId: 'pat_456',
      didClickCreatePatientAndPrescription: true,
      snap_first_name: true,
      snap_last_name: true,
      snap_date_of_birth: true,
      snap_phone: false
    });
  });

  it('resolves a minor CTA with ctaName and preserves extra properties', () => {
    const { track, calls } = createTrackSpy();

    const detail: PhotonEmbedAnalyticsEventInput = {
      category: 'ctaClicked',
      name: 'Minor CTA Clicked',
      ctaName: 'screening alert acknowledged',
      screeningAlertCount: 3
    };

    trackAnalyticsEvent(detail, track);

    expect(track).toHaveBeenCalledOnce();
    expect(calls[0].eventName).toBe('Minor CTA Clicked');
    expect(calls[0].payload).toEqual({
      ctaName: 'screening alert acknowledged',
      screeningAlertCount: 3
    });
  });

  it('resolves a field interaction with formName and isOptional', () => {
    const { track, calls } = createTrackSpy();

    const detail: PhotonEmbedAnalyticsEventInput = {
      category: 'fieldInteraction',
      name: 'Field Interaction',
      formName: 'add_prescription_form',
      fieldName: 'treatment',
      hasValue: true,
      isOptional: false
    };

    trackAnalyticsEvent(detail, track);

    expect(track).toHaveBeenCalledOnce();
    expect(calls[0].eventName).toBe('Field Interaction');
    expect(calls[0].payload).toEqual({
      formName: 'add_prescription_form',
      fieldName: 'treatment',
      hasValue: true,
      isOptional: false
    });
  });
});
