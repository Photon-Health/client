import { PhotonEmbedAnalyticsEventDetail } from '@photonhealth/components';

function flattenSnapshot(
  fields: PhotonEmbedAnalyticsEventDetail['fields']
): Record<string, boolean | null> {
  if (!fields) return {};
  return Object.fromEntries(
    Object.entries(fields).map(([key, val]) => [
      `snap_${key.replace(/([A-Z])/g, '_$1').toLowerCase()}`,
      val.completed
    ])
  );
}

export function buildPatientFormInteractionPayload(detail: PhotonEmbedAnalyticsEventDetail) {
  const { fields, properties, trackEventType } = detail;
  return {
    trackEventType,
    fieldName: (properties?.fieldName as string) ?? null,
    fieldHasValue: (properties?.hasValue as boolean) ?? null,
    patientId: (properties?.patientId as string) ?? null,
    isEdit: (properties?.isEdit as boolean) ?? null,
    didClickCreatePatientAndPrescription:
      (properties?.didClickCreatePatientAndPrescription as boolean) ?? null,
    ...flattenSnapshot(fields)
  };
}

export function buildSignatureAttestationFormInteractionPayload(
  detail: PhotonEmbedAnalyticsEventDetail
) {
  const { fields, properties, trackEventType } = detail;
  return {
    trackEventType,
    attestationVersion: (properties?.attestationVersion as string) ?? null,
    ...flattenSnapshot(fields)
  };
}
