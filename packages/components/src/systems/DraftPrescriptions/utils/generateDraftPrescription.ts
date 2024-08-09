import { format } from 'date-fns';
import { Prescription, PrescriptionTemplate } from '@photonhealth/sdk/dist/types';

const generateDraftPrescription = (prescription: Prescription | PrescriptionTemplate) => ({
  id: String(Math.random()),
  effectiveDate: format(new Date(), 'yyyy-MM-dd').toString(),
  treatment: prescription.treatment,
  dispenseAsWritten: prescription.dispenseAsWritten,
  dispenseQuantity: prescription.dispenseQuantity,
  dispenseUnit: prescription.dispenseUnit,
  daysSupply: prescription.daysSupply,
  // when we pre-populate draft prescriptions using template ID's, we need need to update the value for refills here
  refillsInput: prescription.fillsAllowed ? prescription.fillsAllowed - 1 : 0,
  fillsAllowed: prescription.fillsAllowed,
  instructions: prescription.instructions,
  notes: prescription.notes,
  addToTemplates: false,
  catalogId: undefined,
  isPrivate: prescription.__typename === 'PrescriptionTemplate' ? prescription.isPrivate : true,
  name: prescription.__typename === 'PrescriptionTemplate' ? prescription.name : null,
  externalId: prescription.externalId
});

export default generateDraftPrescription;
