import { formatPrescriptionDetails } from './formatPrescriptionDetail';

test('formats all prescription details', () => {
  const actual = formatPrescriptionDetails({
    daysSupply: 444,
    instructions: 'test-instructions',
    dispenseQuantity: 111,
    dispenseUnit: 'Each',
    fillsAllowed: 555
  });

  expect(actual).toEqual(
    'QTY: 111 Each | Days Supply: 444 | Refills: 554 | Sig: test-instructions'
  );
});

test('formats missing prescription', () => {
  const actual = formatPrescriptionDetails(undefined);

  expect(actual).toEqual('QTY: N/A | Days Supply: N/A | Refills: N/A | Sig: N/A');
});

test('formats partial prescription details', () => {
  const actual = formatPrescriptionDetails({
    daysSupply: undefined,
    instructions: '',
    dispenseQuantity: 0,
    dispenseUnit: '',
    fillsAllowed: 0
  });

  expect(actual).toEqual('QTY: 0 | Days Supply: N/A | Refills: 0 | Sig: N/A');
});
