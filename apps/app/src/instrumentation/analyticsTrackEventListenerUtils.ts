import type {
  FieldCompletionSnapshot,
  PatientFormAnalyticsEvent,
  SignatureAttestationAnalyticsEvent,
  PrescriptionFormAnalyticsEvent
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
  const { trackEventType } = detail;
  // Use a plain object to safely extract optional properties without TS narrowing issues
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const props: Record<string, any> = detail.properties ?? {};
  return {
    trackEventType,
    fieldName: props.fieldName ?? null,
    fieldHasValue: props.hasValue ?? null,
    patientId: props.patientId ?? null,
    orderId: props.orderId ?? null,
    prescriptionCount: props.prescriptionCount ?? null,
    enableOrder: props.enableOrder ?? null,
    hadUnsavedWork: props.hadUnsavedWork ?? null,
    alertCount: props.alertCount ?? null,
    tabSelected: props.tabSelected ?? null,
    hasPreferredPharmacy: props.hasPreferredPharmacy ?? null,
    setAsPreferred: props.setAsPreferred ?? null,
    ...flattenSnapshot(props.fields)
  };
}
