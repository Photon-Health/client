import { Prescription } from '@photonhealth/sdk/dist/types';
import { PrescriptionFormData } from '../../PrescribeProvider';
import { format } from 'date-fns';

export function toPrescriptionFormData(
  prescription: Prescription,
  catalogId?: string
): PrescriptionFormData {
  return {
    id: prescription.id,
    effectiveDate: format(new Date(), 'yyyy-MM-dd').toString(),
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
