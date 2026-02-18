import { Prescription } from '@photonhealth/sdk/dist/types';
import { PrescriptionFormData } from '../DraftPrescriptionsProvider';

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
