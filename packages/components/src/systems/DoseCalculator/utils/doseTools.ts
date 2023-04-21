export type WeightUnit = 'kgs' | 'g' | 'lbs' | 'oz';
export type DosageUnit = 'kg' | 'lb' | 'mcg' | 'mg' | 'g';
export type LiquidUnit = 'mcg' | 'mg' | 'g';

export interface Weight {
  value: number;
  unit: WeightUnit;
}

export interface Dosage {
  value: number;
  unit: DosageUnit;
}

export interface Liquid {
  value: number;
  unit: LiquidUnit;
}

type ConversionFactors = {
  [key in DosageUnit]: {
    [key in WeightUnit | LiquidUnit]?: number;
  };
};

const conversionFactors: ConversionFactors = {
  kg: {
    oz: (1 / 16) * 0.453592,
    lbs: 0.453592,
    kgs: 1,
    g: 1 / 1000
  },
  lb: {
    kgs: 2.20462,
    g: 2.20462 / 1000,
    lbs: 1,
    oz: 1 / 16
  },
  mcg: {
    mcg: 1,
    mg: 1 / 1000,
    g: 1 / (1000 * 1000)
  },
  mg: {
    mcg: 1000,
    mg: 1,
    g: 1 / 1000
  },
  g: {
    mcg: 1000 * 1000,
    mg: 1000,
    g: 1
  }
};

export const convertUnit = (dosageUnit: DosageUnit, unit: Weight | Liquid): number => {
  return dosageUnit in conversionFactors && unit.unit in conversionFactors[dosageUnit]
    ? unit.value * (conversionFactors[dosageUnit][unit.unit] ?? 0)
    : 0;
};

export const compatibleDosageWeight = (dosageUnit: DosageUnit, weightUnit: WeightUnit): boolean =>
  ((weightUnit === 'kgs' || weightUnit === 'g') && dosageUnit === 'kg') ||
  ((weightUnit === 'lbs' || weightUnit === 'oz') && dosageUnit === 'lb');

export const compatibleLiquid = (dosageUnit: DosageUnit, liquidDosageUnit: LiquidUnit): boolean =>
  dosageUnit === liquidDosageUnit;

export const calculateDosage = (dosage: Dosage, weight: Weight): number => {
  const isCompatible = compatibleDosageWeight(dosage.unit, weight.unit);
  const dosageWeight = isCompatible
    ? weight.value * (conversionFactors[dosage.unit][weight.unit] ?? 0)
    : convertUnit(dosage.unit, weight);

  return dosage.value * dosageWeight;
};

export const calculateLiquidDosage = (
  dosage: number,
  dosageUnit: DosageUnit,
  drug: number,
  drugUnit: LiquidUnit,
  volume: number
): number => {
  if (isNaN(drug) || drug === 0) {
    return 0;
  }

  const drugAmount = compatibleLiquid(dosageUnit, drugUnit)
    ? drug
    : convertUnit(dosageUnit, { value: drug, unit: drugUnit });

  return (dosage * volume) / drugAmount;
};
