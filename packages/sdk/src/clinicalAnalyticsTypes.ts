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
  | { name: 'Signature Attestation Viewed'; attestationVersion: string };

// ---------------------------------------------------------------------------
// CTA Click Events
// major events get unique names and represent major milestones in the user journey
// minor events share the event name "Minor CTA Clicked"
// ---------------------------------------------------------------------------

export type MajorCtaClickEvent =
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
  | { name: 'Attestation Agreed'; buttonText: string; attestationVersion: string }
  | { name: 'Attestation Canceled'; buttonText: string }
  | { name: 'Order Canceled'; buttonText: string; orderId: string };

export type MinorCtaClickEvent =
  | {
      name: 'Minor CTA Clicked';
      ctaName: 'draft prescription added';
      draftPrescriptionSource: DraftPrescriptionSource;
      fields?: FieldCompletionSnapshot;
    }
  | { name: 'Minor CTA Clicked'; ctaName: 'edit draft' }
  | { name: 'Minor CTA Clicked'; ctaName: 'delete draft' }
  | { name: 'Minor CTA Clicked'; ctaName: 'add to medication history' }
  | { name: 'Minor CTA Clicked'; ctaName: 'yes combine orders' }
  | { name: 'Minor CTA Clicked'; ctaName: 'no send new order' }
  | {
      name: 'Minor CTA Clicked';
      ctaName: 'screening alert acknowledged';
      screeningAlertCount: number;
    }
  | {
      name: 'Minor CTA Clicked';
      ctaName: 'screening alert canceled';
      screeningAlertCount: number;
    }
  | { name: 'Minor CTA Clicked'; ctaName: 'edit patient' }
  | {
      name: 'Minor CTA Clicked';
      ctaName: 'select pharmacy';
      orderId: string;
      pharmacyId: string;
    };

export type CtaClickEvent = MajorCtaClickEvent | MinorCtaClickEvent;

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
