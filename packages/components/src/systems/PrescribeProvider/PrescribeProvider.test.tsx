import { isTreatmentInDraftPrescriptions, PrescriptionFormData } from './index';

test('isTreatmentInDraftPrescriptions prevents duplicates', async () => {
  expect(
    isTreatmentInDraftPrescriptions(generatePrescriptionFormData({ id: 'test-treatment-id-1' }), [
      { treatment: { id: 'test-treatment-id-1' } }
    ])
  ).toBe(true);

  expect(
    isTreatmentInDraftPrescriptions(generatePrescriptionFormData({ id: 'test-treatment-id-2' }), [
      { treatment: { id: 'test-treatment-id-1' } }
    ])
  ).toBe(false);
});

function generatePrescriptionFormData(
  overrides: Partial<PrescriptionFormData> = {}
): PrescriptionFormData {
  return {
    diagnoseCodes: [],
    dispenseAsWritten: false,
    effectiveDate: '',
    instructions: '',
    notes: '',
    treatment: { id: '', name: '' },
    ...overrides
  };
}
