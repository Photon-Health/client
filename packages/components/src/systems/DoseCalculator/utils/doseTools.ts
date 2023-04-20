export type WeightUnit = 'kgs' | 'g' | 'lbs' | 'oz';
export type DosageUnit = 'kg' | 'lb' | 'mcg' | 'mg' | 'g';

export interface Weight {
  value: number;
  unit: WeightUnit;
}

export interface Dosage {
  value: number;
  unit: DosageUnit;
}
export type LiquidUnit = 'mcg' | 'mg' | 'g';

export interface Liquid {
  value: number;
  unit: LiquidUnit;
}

export const compatibleDosageWeight = (dosageUnit: DosageUnit, weightUnit: WeightUnit): boolean =>
  ((weightUnit === 'kgs' || weightUnit === 'g') && dosageUnit === 'kg') ||
  ((weightUnit === 'lbs' || weightUnit === 'oz') && dosageUnit === 'lb');

interface ConversionFactors {
  [key: string]: {
    [key: string]: number;
  };
}

const conversionFactors: ConversionFactors = {
  kg: { oz: (1 / 16) * 0.453592, lbs: 0.453592 },
  lb: { kgs: 2.20462, g: 2.20462 / 1000 },
  mcg: { mcg: 1, g: 1000 * 1000 },
  mg: { mcg: 1 / 1000, g: 1000 },
  g: { mcg: 1 / (1000 * 1000), mg: 1 / 1000 }
};

export const convertCompatibleWeight = (dosageUnit: DosageUnit, weight: Weight): number => {
  return dosageUnit in conversionFactors && weight.unit in conversionFactors[dosageUnit]
    ? weight.value * conversionFactors[dosageUnit][weight.unit]
    : 0;
};

export const compatibleLiquid = (dosageUnit: DosageUnit, liquidDosageUnit: LiquidUnit): boolean =>
  dosageUnit === liquidDosageUnit;

export const convertCompatibleLiquid = (dosageUnit: DosageUnit, liquid: Liquid): number => {
  return dosageUnit in conversionFactors && liquid.unit in conversionFactors[dosageUnit]
    ? liquid.value * conversionFactors[dosageUnit][liquid.unit]
    : 0;
};

export const calculateDosage = (dosage: Dosage, weight: Weight): number => {
  const isCompatible = compatibleDosageWeight(dosage.unit, weight.unit);
  const dosageWeight = isCompatible
    ? weight.value * conversionFactors[dosage.unit][weight.unit]
    : convertCompatibleWeight(dosage.unit, weight);

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
    : convertCompatibleLiquid(dosageUnit, { value: drug, unit: drugUnit });

  return (dosage * volume) / drugAmount;
};
