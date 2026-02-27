export interface FieldCompletionSnapshot {
  [fieldName: string]: { completed: boolean };
}

// ---------------------------------------------------------------------------
// Typesafe form analytics events (photon-analytics-track-event CustomEvent)
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
  | 'draft_prescription_added'
  | 'draft_prescription_deleted'
  | 'draft_prescription_edited'
  | 'draft_prescriptions_activated'
  | 'order_created'
  | 'screening_alert_acknowledged'
  | 'screening_alert_canceled'
  | 'prescription_form_closed'
  | 'prescription_field_interaction'
  | 'pharmacy_interaction';

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
  properties: {
    prefillPatientId: string;
    prefillPharmacyId: string;
    hasPrefillPatientExternalId: boolean;
    hasPrefillTemplateIds: boolean;
    hasPrefillPrescriptionIds: boolean;
    hasPrefillWeight: boolean;
    weightUnit: string;
  };
};
export type DraftPrescriptionSource = 'form' | 'med_history_refill' | 'prefill';

type DraftPrescriptionAdded = {
  trackEventType: 'draft_prescription_added';
  properties: { source: DraftPrescriptionSource; fields?: FieldCompletionSnapshot };
};
type DraftPrescriptionDeleted = {
  trackEventType: 'draft_prescription_deleted';
  properties?: never;
};
type DraftPrescriptionEdited = { trackEventType: 'draft_prescription_edited'; properties?: never };
type OrderCreated = {
  trackEventType: 'order_created';
  properties: {
    orderId: string;
    prescriptionCount: number;
    fulfillmentType: string | null;
    hasPreferredPharmacy: boolean;
    setAsPreferred: boolean;
    pharmacyId: string | null;
  };
};
type DraftPrescriptionsActivated = {
  trackEventType: 'draft_prescriptions_activated';
  properties: {
    prescriptionCount: number;
  };
};
type AlertAcknowledged = {
  trackEventType: 'screening_alert_acknowledged';
  properties: { screeningAlertCount: number };
};
type AlertCanceled = {
  trackEventType: 'screening_alert_canceled';
  properties: { screeningAlertCount: number };
};
type PrescriptionFormClosed = {
  trackEventType: 'prescription_form_closed';
  properties: { hadUnsavedWork: boolean; fields?: FieldCompletionSnapshot };
};
type PrescriptionFieldInteraction = {
  trackEventType: 'prescription_field_interaction';
  properties: { fieldName: string; hasValue: boolean };
};
type PharmacyInteraction = {
  trackEventType: 'pharmacy_interaction';
  properties: {
    tabSelected: string;
    hasPreferredPharmacy: boolean;
    setAsPreferred?: boolean;
  };
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
  | DraftPrescriptionAdded
  | DraftPrescriptionDeleted
  | DraftPrescriptionEdited
  | OrderCreated
  | DraftPrescriptionsActivated
  | AlertAcknowledged
  | AlertCanceled
  | PrescriptionFormClosed
  | PrescriptionFieldInteraction
  | PharmacyInteraction;

export type PatientFormAnalyticsEvent = Extract<
  PhotonEmbedAnalyticsEventInput,
  { trackEventType: PatientFormTrackEventType }
>;

export type SignatureAttestationAnalyticsEvent = Extract<
  PhotonEmbedAnalyticsEventInput,
  { trackEventType: SignatureAttestationTrackEventType }
>;

export type PrescriptionFormAnalyticsEvent = Extract<
  PhotonEmbedAnalyticsEventInput,
  { trackEventType: PrescriptionFormTrackEventType }
>;
