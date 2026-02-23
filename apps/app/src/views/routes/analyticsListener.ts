import { FormAnalyticsEventDetail } from '@photonhealth/components';

function flattenSnapshot(
  fields: FormAnalyticsEventDetail['fields']
): Record<string, boolean | null> {
  if (!fields) return {};
  return Object.fromEntries(
    Object.entries(fields).map(([key, val]) => [
      `snap_${key.replace(/([A-Z])/g, '_$1').toLowerCase()}`,
      val.completed
    ])
  );
}

export function buildFormInteractionPayload(detail: FormAnalyticsEventDetail) {
  const { formName, milestone, fields, properties } = detail;
  return {
    form_name: formName,
    milestone,
    field_name: (properties?.fieldName as string) ?? null,
    field_has_value: (properties?.hasValue as boolean) ?? null,
    patient_id: (properties?.patientId as string) ?? null,
    is_edit: (properties?.isEdit as boolean) ?? null,
    clicked_create_patient_and_prescription: (properties?.createPrescription as boolean) ?? null,
    attestation_version: (properties?.attestationVersion as string) ?? null,
    ...flattenSnapshot(fields)
  };
}
