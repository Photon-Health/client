export type AnalyticsCategory = 'elementViewed' | 'ctaClicked' | 'fieldInteraction';

export interface FieldCompletionSnapshot {
  [fieldName: string]: { completed: boolean };
}

export type DraftPrescriptionSource =
  | 'form'
  | 'med_history_refill'
  | 'template_prefill'
  | 'prescription_id_prefill'
  | 'initial_prescriptions_prefill';

// ---------------------------------------------------------------------------
// Element View Events — each element gets a unique event name
// ---------------------------------------------------------------------------

export type ElementViewEvent =
  | {
      name: 'Prescribe Workflow Viewed';
      patientId?: string;
      catalogId?: string;
      groupId?: string;
      mailOrderIds?: string;
      pharmacyId?: string;
      hasExternalOrderId: boolean;
      hasDisableList: boolean;
      disableList?: string[];
      hideSubmit: boolean;
      hideTemplates: boolean;
      hidePatientCard: boolean;
      enableOrder: boolean;
      enableMedHistory: boolean;
      enableMedHistoryLinks: boolean;
      enableMedHistoryRefillButton: boolean;
      enableCombineAndDuplicate: boolean;
      enableCoverageCheck: boolean;
      enableLocalPickup: boolean;
      enableSendToPatient: boolean;
      enableDeliveryPharmacies: boolean;
      optionalPatientAddress: boolean;
      allowOffCatalogSearch: boolean;
      triggerSubmit: boolean;
      toastBuffer: number;
      // Prescription prefill behavior
      // Not logging full objects since Mixpanel
      // encourages use of primitive values
      // Whether any value was passed in
      hasTemplateIdsPrefill: boolean;
      // If able to parse value, how many were passed in
      numTemplateIds: number;
      // Whether overrides were passed in
      hasTemplateOverridesPrefill: boolean;
      hasPrescriptionIdsPrefill: boolean;
      numPrescriptionIds: number;
      hasPrescriptionOverridesPrefill: boolean;
      hasInitialPrescriptionsPrefill: boolean;
      numInitialPrescriptions: number;
      // Other prefill behavior
      hasSupervisorPrefill: boolean;
      hasDiagnosisCodesPrefill: boolean;
      hasAddressPrefill: boolean;
      additionalNotesLength: number;
      hasWeight: boolean;
      hasWeightUnit: boolean;
    }
  | {
      name: 'Signature Attestation Element Viewed';
      attestationVersion: string;
    }
  | {
      name: 'Pharmacy Select Element Viewed';
      tabs: string[];
      initialTabSelected: string;
    };

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
  | { name: 'Pharmacy Selected by Provider'; orderId: string; pharmacyId: string };

// ---------------------------------------------------------------------------
// Field Interaction Events — all share "Field Interaction"
//
// The purpose is to track manual user interactions, not programmatic updates
// to form fields.
// ---------------------------------------------------------------------------

export type FieldInteractionEvent =
  | {
      name: 'Field Interaction';
      formName: string;
      fieldName: string;
      hasValue: boolean;
      isOptional: boolean;
    }
  | { name: 'Field Interaction'; formName: string; patientId: string }
  | {
      name: 'Field Interaction';
      formName: 'select_pharmacy';
      tabSelected: string;
      hasPreferredPharmacy: boolean;
      setAsPreferred?: boolean;
    }
  | {
      name: 'Field Interaction';
      formName: 'select_pharmacy';
      currentTab: string;
      pharmacySelected: string;
      pharmacySelectedName?: string;
    };

// ---------------------------------------------------------------------------
// Event map — used by dispatchAnalyticsTrackEvent generic
// ---------------------------------------------------------------------------
export type AnalyticsEventMap = {
  elementViewed: ElementViewEvent;
  ctaClicked: CtaClickEvent;
  fieldInteraction: FieldInteractionEvent;
};

// ---------------------------------------------------------------------------
// Combined type — the CustomEvent detail shape used by the listener side
// ---------------------------------------------------------------------------
export type PhotonEmbedAnalyticsEventInput =
  | ({ category: 'elementViewed' } & ElementViewEvent)
  | ({ category: 'ctaClicked' } & CtaClickEvent)
  | ({ category: 'fieldInteraction' } & FieldInteractionEvent);

// ---------------------------------------------------------------------------
// RudderStack event names — resolved dynamically by the listener side
// ---------------------------------------------------------------------------
export type ClinicalAppEventName = string;
