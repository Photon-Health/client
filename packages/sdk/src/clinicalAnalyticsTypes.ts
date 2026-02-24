export interface FieldCompletionSnapshot {
  [fieldName: string]: { completed: boolean };
}

// ---------------------------------------------------------------------------
// Typesafe form analytics events (photon-analytics-event CustomEvent)
// ---------------------------------------------------------------------------

export type PatientFormTrackEventType =
  | 'patient_form_opened'
  | 'patient_created'
  | 'patient_updated'
  | 'patient_form_closed'
  | 'patient_field_interaction';

export type SignatureAttestationTrackEventType =
  | 'signature_attestation_shown'
  | 'signature_attestation_agreed'
  | 'signature_attestation_canceled';

export type PrescriptionFormTrackEventType =
  | 'prescription_form_opened'
  | 'draft_added'
  | 'draft_deleted'
  | 'draft_edited'
  | 'prescription_form_submitted'
  | 'order_created'
  | 'alert_acknowledged'
  | 'alert_canceled'
  | 'prescription_form_closed'
  | 'prescription_field_interaction';

export type FormTrackEventType =
  | PatientFormTrackEventType
  | SignatureAttestationTrackEventType
  | PrescriptionFormTrackEventType;

// fields lives inside properties for events that support a field snapshot —
// keeps dispatch calls to a single object and makes clear which events carry
// snapshot data.

type PatientFormOpened = { trackEventType: 'patient_form_opened'; properties: { isEdit: boolean } };
type PatientCreated = {
  trackEventType: 'patient_created';
  properties: {
    patientId: string;
    didClickCreatePatientAndPrescription: boolean;
    fields?: FieldCompletionSnapshot;
  };
};
type PatientUpdated = {
  trackEventType: 'patient_updated';
  properties: {
    patientId: string;
    didClickCreatePatientAndPrescription: boolean;
    fields?: FieldCompletionSnapshot;
  };
};
type PatientFormClosed = {
  trackEventType: 'patient_form_closed';
  properties: { isEdit: boolean; fields?: FieldCompletionSnapshot };
};
type PatientFieldInteraction = {
  trackEventType: 'patient_field_interaction';
  properties: { fieldName: string; hasValue: boolean };
};

type SigAttestationShown = {
  trackEventType: 'signature_attestation_shown';
  properties: { attestationVersion: string };
};
type SigAttestationAgreed = {
  trackEventType: 'signature_attestation_agreed';
  properties: { attestationVersion: string };
};
type SigAttestationCanceled = {
  trackEventType: 'signature_attestation_canceled';
  properties?: never;
};

type PrescriptionFormOpened = {
  trackEventType: 'prescription_form_opened';
  properties: { patientId: string };
};
type DraftAdded = {
  trackEventType: 'draft_added';
  properties: { treatmentName: string; fields?: FieldCompletionSnapshot };
};
type DraftDeleted = { trackEventType: 'draft_deleted'; properties: { treatmentName: string } };
type DraftEdited = { trackEventType: 'draft_edited'; properties: { treatmentName: string } };
type PrescriptionFormSubmitted = {
  trackEventType: 'prescription_form_submitted';
  properties: { prescriptionCount: number; enableOrder: boolean; fields?: FieldCompletionSnapshot };
};
type OrderCreated = { trackEventType: 'order_created'; properties: { orderId: string } };
type AlertAcknowledged = {
  trackEventType: 'alert_acknowledged';
  properties: { alertCount: number };
};
type AlertCanceled = { trackEventType: 'alert_canceled'; properties: { alertCount: number } };
type PrescriptionFormClosed = {
  trackEventType: 'prescription_form_closed';
  properties: { hadUnsavedWork: boolean; fields?: FieldCompletionSnapshot };
};
type PrescriptionFieldInteraction = {
  trackEventType: 'prescription_field_interaction';
  properties: { fieldName: string; hasValue: boolean };
};

// Input type passed to dispatchAnalyticsTrackEvent — no timestamp (added by the dispatch fn).
// Do NOT derive an "input" type via Omit on the full detail type; Omit doesn't distribute
// over unions and collapses the discriminant.
export type PhotonEmbedAnalyticsEventInput =
  | PatientFormOpened
  | PatientCreated
  | PatientUpdated
  | PatientFormClosed
  | PatientFieldInteraction
  | SigAttestationShown
  | SigAttestationAgreed
  | SigAttestationCanceled
  | PrescriptionFormOpened
  | DraftAdded
  | DraftDeleted
  | DraftEdited
  | PrescriptionFormSubmitted
  | OrderCreated
  | AlertAcknowledged
  | AlertCanceled
  | PrescriptionFormClosed
  | PrescriptionFieldInteraction;

export type PatientFormAnalyticsEvent = Extract<
  PhotonEmbedAnalyticsEventInput,
  { trackEventType: PatientFormTrackEventType }
>;

export type SignatureAttestationAnalyticsEvent = Extract<
  PhotonEmbedAnalyticsEventInput,
  { trackEventType: SignatureAttestationTrackEventType }
>;
