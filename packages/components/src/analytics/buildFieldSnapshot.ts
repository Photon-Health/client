import { FieldCompletionSnapshot } from './dispatchAnalyticsTrackEvent';

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
    fieldNames.map((name) => [name, { completed: Boolean(store[name]?.value) }])
  );
};
