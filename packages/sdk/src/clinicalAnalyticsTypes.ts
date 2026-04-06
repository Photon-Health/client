export type AnalyticsCategory = 'pageViewed' | 'ctaClicked' | 'fieldInteraction';

export interface FieldCompletionSnapshot {
  [fieldName: string]: { completed: boolean };
}

export type DraftPrescriptionSource = 'form' | 'med_history_refill' | 'prefill';

// ---------------------------------------------------------------------------
// Page View Events — each page gets a unique event name
// ---------------------------------------------------------------------------

export type PageViewEvent =
  | { name: 'New Patient Page Viewed' }
  | { name: 'Update Patient Page Viewed' }
  | {
      name: 'New Prescriptions Page Viewed';
      prefillPatientId: string;
      prefillPharmacyId: string;
      hasPrefillPatientExternalId: boolean;
      hasPrefillTemplateIds: boolean;
      hasPrefillPrescriptionIds: boolean;
      hasPrefillWeight: boolean;
      weightUnit: string;
    }
  | { name: 'Signature Attestation Page Viewed'; attestationVersion: string };

// ---------------------------------------------------------------------------
// CTA Click Events — each variant has a unique, descriptive name
// ---------------------------------------------------------------------------

export type CtaClickEvent =
  | {
      name: 'Patient Created';
      buttonText: string;
      patientId: string;
      didClickCreatePatientAndPrescription: boolean;
      fields?: FieldCompletionSnapshot;
    }
  | {
      name: 'Patient Updated';
      buttonText: string;
      patientId: string;
      didClickCreatePatientAndPrescription: boolean;
      fields?: FieldCompletionSnapshot;
    }
  | {
      name: 'Order Sent';
      buttonText: string;
      orderId: string;
      prescriptionCount: number;
      fulfillmentType: string | null;
      hasPreferredPharmacy: boolean;
      setAsPreferred: boolean;
      pharmacyId: string | null;
      isCombinedOrder: boolean;
    }
  | { name: 'Prescriptions Activated'; buttonText: string; prescriptionCount: number }
  | { name: 'Signature Attestation Agreed'; buttonText: string; attestationVersion: string }
  | { name: 'Signature Attestation Canceled'; buttonText: string }
  | { name: 'Order Canceled'; buttonText: string; orderId: string }
  | {
      name: 'Draft Prescription Added';
      draftPrescriptionSource: DraftPrescriptionSource;
      fields?: FieldCompletionSnapshot;
    }
  | { name: 'Draft Prescription Edited' }
  | { name: 'Draft Prescription Deleted' }
  | { name: 'Added To Medication History' }
  | { name: 'Combine Orders Confirmed'; buttonText: string }
  | { name: 'Combine Orders Rejected'; buttonText: string }
  | { name: 'Patient Edited' }
  | { name: 'Screening Alert Acknowledged'; screeningAlertCount: number; buttonText: string }
  | { name: 'Screening Alert Canceled'; screeningAlertCount: number; buttonText: string }
  | { name: 'Pharmacy Selected'; orderId: string; pharmacyId: string };

// ---------------------------------------------------------------------------
// Field Interaction Events — all share "Field Interaction"
// ---------------------------------------------------------------------------

export type FieldInteractionEvent =
  | {
      name: 'Field Interaction';
      formName: string;
      fieldName: string;
      hasValue: boolean;
      isOptional: boolean;
    }
  | {
      name: 'Field Interaction';
      formName: string;
      tabSelected: string;
      hasPreferredPharmacy: boolean;
      setAsPreferred?: boolean;
    }
  | { name: 'Field Interaction'; formName: string; patientId: string };

// ---------------------------------------------------------------------------
// Event map — used by dispatchAnalyticsTrackEvent generic
// ---------------------------------------------------------------------------
export type AnalyticsEventMap = {
  pageViewed: PageViewEvent;
  ctaClicked: CtaClickEvent;
  fieldInteraction: FieldInteractionEvent;
};

// ---------------------------------------------------------------------------
// Combined type — the CustomEvent detail shape used by the listener side
// ---------------------------------------------------------------------------
export type PhotonEmbedAnalyticsEventInput =
  | ({ category: 'pageViewed' } & PageViewEvent)
  | ({ category: 'ctaClicked' } & CtaClickEvent)
  | ({ category: 'fieldInteraction' } & FieldInteractionEvent);

// ---------------------------------------------------------------------------
// RudderStack event names — resolved dynamically by the listener side
// ---------------------------------------------------------------------------
export type ClinicalAppEventName = string;
