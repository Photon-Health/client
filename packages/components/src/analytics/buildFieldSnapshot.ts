import { FieldCompletionSnapshot } from '@photonhealth/sdk';

export const DRAFT_PRESCRIPTION_FORM_FIELDS = [
  'treatment',
  'dispenseQuantity',
  'dispenseUnit',
  'daysSupply',
  'refills',
  'instructions',
  'notes',
  'doNotFillBeforeDate',
  'addToTemplates',
  'templateName'
] as const;

export const PATIENT_FORM_FIELDS = [
  'firstName',
  'lastName',
  'dateOfBirth',
  'phone',
  'sex',
  'gender',
  'email',
  'address_street1',
  'address_street2',
  'address_city',
  'address_state',
  'address_zip',
  'preferredPharmacy'
] as const;

const isCompleted = (val: unknown) =>
  val !== undefined && val !== null && val !== '' && val !== false;

export const buildFieldSnapshot = (
  store: Record<string, { value: unknown } | undefined>,
  fieldNames: readonly string[]
): FieldCompletionSnapshot => {
  return Object.fromEntries(
    fieldNames.map((name) => {
      return [name, { completed: isCompleted(store[name]?.value) }];
    })
  );
};

export const buildPrescriptionSnapshot = (
  data: Record<string, unknown>,
  options?: { addToTemplates?: boolean; templateName?: string }
): FieldCompletionSnapshot => {
  const values: Record<string, unknown> = {
    treatment: data.treatment,
    dispenseQuantity: data.dispenseQuantity,
    dispenseUnit: data.dispenseUnit,
    daysSupply: data.daysSupply,
    refills: data.fillsAllowed != null ? Number(data.fillsAllowed) - 1 : undefined,
    instructions: data.instructions,
    notes: data.notes,
    doNotFillBeforeDate: data.doNotFillBeforeDate,
    addToTemplates: options?.addToTemplates,
    templateName: options?.templateName
  };
  return Object.fromEntries(
    DRAFT_PRESCRIPTION_FORM_FIELDS.map((name) => {
      return [name, { completed: isCompleted(values[name]) }];
    })
  );
};
