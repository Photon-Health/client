import { expect, test } from 'vitest';
import {
  Grams,
  Kilo,
  MicroGrams,
  Miligrams,
  WeightValue,
  convertLiquidToDosageUnit,
  convertWeightToDosageUnits
} from './conversionFactors';

test('Weight conversion: lbs to kg', () => {
  const weightLbs = 20;
  const expectedWeightKg = 9.07184;

  const actualWeightKg = convertWeightToDosageUnits('kg', {
    unit: 'lb',
    value: weightLbs as WeightValue
  });

  expect(expectedWeightKg).toEqual(actualWeightKg);
});

test('Liquid conversion: mg/kg to mcg/kg', () => {
  const mgPerKg = 90;
  const expectedMcgPerKg = 90000;

  const actualMcgPerKg = convertLiquidToDosageUnit('mcg/kg', {
    unit: 'mg',
    value: mgPerKg as Miligrams
  });

  expect(expectedMcgPerKg).toEqual(actualMcgPerKg);
});

test('Liquid conversion: g/kg to mg/kg', () => {
  const gPerKg = 0.05;
  const expectedMgPerKg = 50;

  const actualMgPerKg = convertLiquidToDosageUnit('mg/kg', { unit: 'g', value: gPerKg as Grams });

  expect(expectedMgPerKg).toEqual(actualMgPerKg);
});

test('Weight conversion: kg to lbs', () => {
  const weightKg = 10;
  const expectedWeightLbs = 22.0462;

  const actualWeightLbs = convertWeightToDosageUnits('lb', { unit: 'kg', value: weightKg as Kilo });

  expect(expectedWeightLbs).toBeCloseTo(actualWeightLbs, 4);
});

test('Liquid conversion: mcg/kg to mg/kg', () => {
  const mcgPerKg = 120000;
  const expectedMgPerKg = 120;

  const actualMgPerKg = convertLiquidToDosageUnit('mg/kg', {
    unit: 'mcg',
    value: mcgPerKg as MicroGrams
  });

  expect(expectedMgPerKg).toEqual(actualMgPerKg);
});

test('Liquid conversion: mcg/kg to g/kg', () => {
  const mcgPerKg = 3000000;
  const expectedGPerKg = 3;

  const actualGPerKg = convertLiquidToDosageUnit('g/kg', {
    unit: 'mcg',
    value: mcgPerKg as MicroGrams
  });

  expect(expectedGPerKg).toEqual(actualGPerKg);
});

test('Liquid conversion: g/kg to mcg/kg', () => {
  const gPerKg = 0.002;
  const expectedMcgPerKg = 2000;

  const actualMcgPerKg = convertLiquidToDosageUnit('mcg/kg', { unit: 'g', value: gPerKg as Grams });

  // using toBeCloseTo because of floating point precision
  expect(expectedMcgPerKg).toBeCloseTo(expectedMcgPerKg, 10);
});
