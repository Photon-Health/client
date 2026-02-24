export type ClinicalAppTrackEventType =
  | 'patient_form_opened'
  | 'patient_form_closed'
  | 'patient_created'
  | 'patient_updated'
  | 'draft_added'
  | 'draft_deleted'
  | 'draft_edited'
  | 'form_submitted'
  | 'order_created'
  | 'alert_acknowledged'
  | 'alert_canceled'
  | 'signature_attestation_shown'
  | 'signature_attestation_agreed'
  | 'signature_attestation_canceled'
  | 'field_interaction';

export interface FieldCompletionSnapshot {
  [fieldName: string]: { completed: boolean };
}

export interface PhotonEmbedAnalyticsEventDetail {
  trackEventType: ClinicalAppTrackEventType;
  fields?: FieldCompletionSnapshot;
  properties?: Record<string, unknown>;
  timestamp: string;
}

export const dispatchAnalyticsTrackEvent = (
  detail: Omit<PhotonEmbedAnalyticsEventDetail, 'timestamp'>,
  ref: { dispatchEvent(event: CustomEvent): void }
) => {
  const event = new CustomEvent('photon-analytics-track-event', {
    composed: true,
    bubbles: true,
    detail: { ...detail, timestamp: new Date().toISOString() }
  });
  ref?.dispatchEvent(event);
};
