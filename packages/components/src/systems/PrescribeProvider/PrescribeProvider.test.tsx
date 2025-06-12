import { isTreatmentInDraftPrescriptions } from './index';

test('isTreatmentInDraftPrescriptions prevents duplicates', async () => {
  expect(
    isTreatmentInDraftPrescriptions('test-treatment-id-1', [
      { treatment: { id: 'test-treatment-id-1' } }
    ])
  ).toBe(true);

  expect(
    isTreatmentInDraftPrescriptions('test-treatment-id-2', [
      { treatment: { id: 'test-treatment-id-1' } }
    ])
  ).toBe(false);
});
