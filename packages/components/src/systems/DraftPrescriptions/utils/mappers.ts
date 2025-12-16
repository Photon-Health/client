import { Prescription } from '@photonhealth/sdk/dist/types';
import { PrescriptionFormData } from '../../PrescribeProvider';
import { isSameDay, parse } from 'date-fns';
import { CALENDAR_DATE_FORMAT } from '../../../utils/formatDate';

export function toPrescriptionFormData(
  prescription: Prescription,
  catalogId?: string
): PrescriptionFormData {
  // We default non-nullable effectiveDate to the day the prescription was written
  // so we assume if the effectiveDate is the same day as writtenAt
  // then the prescriber didn't actively choose an effectiveDate and we don't
  // need to preserve the effectiveDate value
  const didPrescriberChooseEffectiveDate = !isSameDay(
    new Date(prescription.writtenAt),
    parse(prescription.effectiveDate, CALENDAR_DATE_FORMAT, new Date())
  );

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
