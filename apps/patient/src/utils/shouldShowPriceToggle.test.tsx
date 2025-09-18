import { shouldShowPriceToggle } from './shouldShowPriceToggle';
import { expect } from 'vitest';
import { generateFlattenedFill, generateOrder, generateTreatment } from '../test-utils/generators';

test('shows the price toggle switch when order has single medication', async () => {
  const singleNonGLPFill = generateFlattenedFill({
    treatment: generateTreatment({ name: 'Metformin' })
  });

  const order = generateOrder();

  expect(shouldShowPriceToggle([singleNonGLPFill], order)).toEqual(true);
});

test('shows the price toggle switch when order contains GLP-1 medication', () => {
  const glp1MedicationName = 'Semaglutide';
  const glpFill = generateFlattenedFill({
    treatment: generateTreatment({ name: glp1MedicationName })
  });
  const order = generateOrder();

  expect(shouldShowPriceToggle([glpFill], order)).toEqual(true);
});

test('hides the price toggle switch when order contains GLP-1 medication for org that hides glp prices', () => {
  const glp1MedicationName = 'Wegovy';
  const glpFill = generateFlattenedFill({
    treatment: generateTreatment({ name: glp1MedicationName })
  });
  const order = generateOrder({ organization: { id: 'org_hidesGlp1Prices', name: 'test-name' } });

  expect(shouldShowPriceToggle([glpFill], order)).toEqual(false);
});

test('hides the price toggle when order has multiple prescriptions', () => {
  const multipleFills = [
    generateFlattenedFill({
      treatment: generateTreatment({ name: 'Metformin' })
    }),
    generateFlattenedFill({
      treatment: generateTreatment({ name: 'Lisinopril' })
    })
  ];
  const order = generateOrder();

  expect(shouldShowPriceToggle(multipleFills, order)).toEqual(false);
});

test('hides the price toggle when order has multiple prescriptions including GLP-1', () => {
  const glp1MedicationName = 'Ozempic';
  const multipleFillsWithGLP = [
    generateFlattenedFill({
      treatment: generateTreatment({ name: 'Metformin' })
    }),
    generateFlattenedFill({
      treatment: generateTreatment({ name: glp1MedicationName })
    })
  ];

  const order = generateOrder();

  expect(shouldShowPriceToggle(multipleFillsWithGLP, order)).toEqual(false);
});
