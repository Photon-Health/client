import { Prescription } from '@photonhealth/sdk/dist/types';
import type { PrescriptionFormData } from '../DraftPrescriptionsProvider';

export const mapFormDataToPrescriptionInput = (
  prescription: PrescriptionFormData,
  treatmentId: string,
  patientId: string
) => ({
  externalId: prescription.externalId,
  patientId: patientId,
  treatmentId: treatmentId,
  dispenseAsWritten: prescription.dispenseAsWritten,
  dispenseQuantity: prescription.dispenseQuantity,
  dispenseUnit: prescription.dispenseUnit,
  fillsAllowed: prescription.fillsAllowed,
  daysSupply: prescription.daysSupply,
  instructions: prescription.instructions,
  notes: prescription.notes,
  doNotFillBeforeDate: prescription.doNotFillBeforeDate,
  diagnoses: prescription.diagnoseCodes
});

export function toPrescriptionFormData(
  prescription: Prescription,
  catalogId?: string
): PrescriptionFormData {
  return {
    id: prescription.id,
    doNotFillBeforeDate: prescription.doNotFillBeforeDate,
    dispenseAsWritten: prescription.dispenseAsWritten || false,
    dispenseQuantity: prescription.dispenseQuantity,
    dispenseUnit: prescription.dispenseUnit,
    daysSupply: prescription.daysSupply || 0,
    instructions: prescription.instructions,
    notes: prescription.notes || '',
    fillsAllowed: prescription.fillsAllowed,
    diagnoseCodes: [],
    catalogId: catalogId,
    externalId: prescription.externalId || undefined,
    treatment: {
      id: prescription.treatment.id,
      name: prescription.treatment.name
    }
  };
}
