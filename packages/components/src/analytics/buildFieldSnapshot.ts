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

export const buildFieldSnapshot = (
  store: Record<string, { value: unknown } | undefined>,
  fieldNames: readonly string[]
): FieldCompletionSnapshot => {
  return Object.fromEntries(
    fieldNames.map((name) => {
      const val = store[name]?.value;
      return [
        name,
        { completed: val !== undefined && val !== null && val !== '' && val !== false }
      ];
    })
  );
};
