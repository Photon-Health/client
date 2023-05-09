import { test, expect } from 'vitest';
import conversionFactors from './conversionFactors.js';

test('Weight conversion: lbs to kg', () => {
  const weightLbs = 20;
  const expectedWeightKg = 9.07184;

  const actualWeightKg = weightLbs * conversionFactors.weight.lbs;

  expect(expectedWeightKg).toEqual(actualWeightKg);
});

test('Liquid conversion: mg/kg to mcg/kg', () => {
  const mgPerKg = 90;
  const expectedMcgPerKg = 90000;

  const actualMcgPerKg = mgPerKg / conversionFactors.liquid['mg/kg'].mcg;

  expect(expectedMcgPerKg).toEqual(actualMcgPerKg);
});

test('Liquid conversion: g/kg to mg/kg', () => {
  const gPerKg = 0.05;
  const expectedMgPerKg = 50;

  const actualMgPerKg = gPerKg / conversionFactors.liquid['g/kg'].mg;

  expect(expectedMgPerKg).toEqual(actualMgPerKg);
});

test('Weight conversion: kg to lbs', () => {
  const weightKg = 10;
  const expectedWeightLbs = 22.0462;

  const actualWeightLbs = weightKg / conversionFactors.weight.lbs;

  expect(expectedWeightLbs).toBeCloseTo(actualWeightLbs, 4);
});

test('Liquid conversion: mcg/kg to mg/kg', () => {
  const mcgPerKg = 120000;
  const expectedMgPerKg = 120;

  const actualMgPerKg = mcgPerKg / conversionFactors.liquid['mcg/kg'].mg;

  expect(expectedMgPerKg).toEqual(actualMgPerKg);
});

test('Liquid conversion: mcg/kg to g/kg', () => {
  const mcgPerKg = 3000000;
  const expectedGPerKg = 3;

  const actualGPerKg = mcgPerKg / conversionFactors.liquid['mcg/kg'].g;

  expect(expectedGPerKg).toEqual(actualGPerKg);
});

test('Liquid conversion: g/kg to mcg/kg', () => {
  const gPerKg = 0.002;
  const expectedMcgPerKg = 2000;

  const actualMcgPerKg = gPerKg / conversionFactors.liquid['g/kg'].mcg;

  // using toBeCloseTo because of floating point precision
  expect(expectedMcgPerKg).toBeCloseTo(expectedMcgPerKg, 10);
});
