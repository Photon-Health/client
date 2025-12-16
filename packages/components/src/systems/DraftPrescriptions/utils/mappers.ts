import { Prescription } from '@photonhealth/sdk/dist/types';
import { PrescriptionFormData } from '../../PrescribeProvider';
import { isSameDay, parse } from 'date-fns';
import { CALENDAR_DATE_FORMAT } from '../../../utils/formatDate';

export function toPrescriptionFormData(
  prescription: Prescription,
  catalogId?: string
): PrescriptionFormData {
  const written = new Date(prescription.writtenAt);
  const effectiveDate = parse(prescription.effectiveDate, CALENDAR_DATE_FORMAT, new Date());
  const didPrescriberChooseEffectiveDate = !isSameDay(written, effectiveDate);

  return {
    id: prescription.id,
    effectiveDate: didPrescriberChooseEffectiveDate ? prescription.effectiveDate : undefined,
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
