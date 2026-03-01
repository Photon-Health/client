import type {
  FieldCompletionSnapshot,
  PatientFormAnalyticsEvent,
  PrescriptionFormAnalyticsEvent,
  SignatureAttestationAnalyticsEvent
} from '@photonhealth/sdk';

function flattenSnapshot(
  fields: FieldCompletionSnapshot | undefined
): Record<string, boolean | null> {
  if (!fields) return {};
  return Object.fromEntries(
    Object.entries(fields).map(([key, val]) => [
      `snap_${key.replace(/([A-Z])/g, '_$1').toLowerCase()}`,
      val.completed
    ])
  );
}

export function buildPatientFormInteractionPayload(detail: PatientFormAnalyticsEvent) {
  const { trackEventType, properties } = detail;
  return {
    trackEventType,
    fieldName: 'fieldName' in properties ? properties.fieldName : null,
    fieldHasValue: 'hasValue' in properties ? properties.hasValue : null,
    patientId: 'patientId' in properties ? properties.patientId : null,
    isEdit: 'isEdit' in properties ? properties.isEdit : null,
    didClickCreatePatientAndPrescription:
      'didClickCreatePatientAndPrescription' in properties
        ? properties.didClickCreatePatientAndPrescription
        : null,
    ...flattenSnapshot('fields' in properties ? properties.fields : undefined)
  };
}

export function buildSignatureAttestationFormInteractionPayload(
  detail: SignatureAttestationAnalyticsEvent
) {
  const { trackEventType, properties } = detail;
  return {
    trackEventType,
    attestationVersion:
      properties != null && 'attestationVersion' in properties
        ? properties.attestationVersion
        : null
  };
}

export function buildPrescriptionFormInteractionPayload(detail: PrescriptionFormAnalyticsEvent) {
  const { trackEventType, properties } = detail;
  const p = properties ?? {};
  return {
    trackEventType,
    fieldName: 'fieldName' in p ? p.fieldName : null,
    fieldHasValue: 'hasValue' in p ? p.hasValue : null,
    patientId: 'patientId' in p ? p.patientId : null,
    orderId: 'orderId' in p ? p.orderId : null,
    prescriptionCount: 'prescriptionCount' in p ? p.prescriptionCount : null,
    fulfillmentType: 'fulfillmentType' in p ? p.fulfillmentType : null,
    pharmacyId: 'pharmacyId' in p ? p.pharmacyId : null,
    source: 'source' in p ? p.source : null,
    hadUnsavedWork: 'hadUnsavedWork' in p ? p.hadUnsavedWork : null,
    screeningAlertCount: 'screeningAlertCount' in p ? p.screeningAlertCount : null,
    tabSelected: 'tabSelected' in p ? p.tabSelected : null,
    hasPreferredPharmacy: 'hasPreferredPharmacy' in p ? p.hasPreferredPharmacy : null,
    setAsPreferred: 'setAsPreferred' in p ? p.setAsPreferred : null,
    isCombinedOrder: 'isCombinedOrder' in p ? p.isCombinedOrder : null,
    prefillPatientId: 'prefillPatientId' in p ? p.prefillPatientId : null,
    prefillPharmacyId: 'prefillPharmacyId' in p ? p.prefillPharmacyId : null,
    hasPrefillPatientExternalId:
      'hasPrefillPatientExternalId' in p ? p.hasPrefillPatientExternalId : null,
    hasPrefillPrescriptionIds:
      'hasPrefillPrescriptionIds' in p ? p.hasPrefillPrescriptionIds : null,
    hasPrefillTemplateIds: 'hasPrefillTemplateIds' in p ? p.hasPrefillTemplateIds : null,
    hasPrefillWeight: 'hasPrefillWeight' in p ? p.hasPrefillWeight : null,
    weightUnit: 'weightUnit' in p ? p.weightUnit : null,
    ...flattenSnapshot('fields' in p ? p.fields : undefined)
  };
}
