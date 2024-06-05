export type WeightUnits = 'lb' | 'kg' | 'oz' | 'g';
export type LiquidDosageUnits = 'mcg' | 'mg' | 'g';
export type LiquidVolumeUnits = 'mL' | 'L';
export type DosageUnits = 'mcg/kg' | 'mg/kg' | 'g/kg';

export const weightUnits: WeightUnits[] = ['lb', 'kg', 'oz', 'g'];
export const liquidDosageUnits: LiquidDosageUnits[] = ['mcg', 'mg', 'g'];
export const liquidVolumeUnits: LiquidVolumeUnits[] = ['mL', 'L'];
export const dosageUnits: DosageUnits[] = ['mcg/kg', 'mg/kg', 'g/kg'];

export type DosageValue<T extends DosageUnits = DosageUnits> = number & { __brand: T };

export type LiquidDoseValue<T extends LiquidDosageUnits = LiquidDosageUnits> = BrandedValue<T>;
export type LiquidVolumeValue<T extends LiquidVolumeUnits = LiquidVolumeUnits> = BrandedValue<T>;
export type MicroGrams = LiquidDoseValue<'mcg'>;
export type Miligrams = LiquidDoseValue<'mg'>;

export type WeightValue<T extends WeightUnits = WeightUnits> = BrandedValue<T>;
export type Pounds = WeightValue<'lb'>;
export type Kilo = WeightValue<'kg'>;
export type Ounces = WeightValue<'oz'>;
export type Grams = WeightValue<'g'>;

const poundsToKilo = (pounds: Pounds) => (0.453592 * pounds) as Kilo;
const kiloToPounds = (kilo: Kilo) => (2.20462 * kilo) as Pounds;
const ozToPounds = (ozs: Ounces) => (ozs / 16) as Pounds;
const gramsToKilo = (grams: Grams) => (grams / 1000) as Kilo;
const ozsToKilo = (ozs: Ounces) => poundsToKilo(ozToPounds(ozs));
const gramsToPounds = (grams: Grams) => kiloToPounds(gramsToKilo(grams));
const kiloToGrams = (kilo: Kilo) => (1000 * kilo) as Grams;
const poundsToOunces = (pounds: Pounds) => (16 * pounds) as Ounces;

type BrandedValue<T = string> = number & { __brand: T };
type ConversionFunction<Base, T extends Base, U extends Base> = (
  input: BrandedValue<T>
) => BrandedValue<U>;
type UnitConversionMap<Base extends string> = {
  [T in Base]: { [U in Base]: ConversionFunction<Base, T, U> };
};

export type ValueWithUnits<Unit> = { unit: Unit; value: BrandedValue<Unit> };

const WEIGHT_CONVERSION_MAP: UnitConversionMap<WeightUnits> = {
  lb: {
    lb: (pounds: Pounds) => pounds,
    kg: poundsToKilo,
    oz: (pounds: Pounds) => (16 * pounds) as Ounces,
    g: (pounds: Pounds) => kiloToGrams(poundsToKilo(pounds))
  },
  kg: {
    lb: kiloToPounds,
    kg: (kilo: Kilo) => kilo,
    oz: (kilo: Kilo) => poundsToOunces(kiloToPounds(kilo)),
    g: (kilo: Kilo) => (1000 * kilo) as Grams
  },
  oz: {
    lb: ozToPounds,
    kg: ozsToKilo,
    oz: (ozs: Ounces) => ozs,
    g: (ozs: Ounces) => kiloToGrams(ozsToKilo(ozs))
  },
  g: {
    lb: gramsToPounds,
    kg: gramsToKilo,
    oz: (grams: Grams) => poundsToOunces(gramsToPounds(grams)),
    g: (grams: Grams) => grams
  }
};

export const convertWeightToDosageUnits = (
  dosageUnit: WeightUnits,
  weight: ValueWithUnits<WeightUnits>
) => {
  // Need to cast to `any` because TS narrowing won't work
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return WEIGHT_CONVERSION_MAP[weight.unit][dosageUnit](weight.value as any);
};

const LIQUID_CONVERSION_MAP: UnitConversionMap<LiquidDosageUnits> = {
  g: {
    g: (g) => g,
    mcg: (g) => (g * 1000 * 1000) as MicroGrams,
    mg: (g) => (g * 1000) as Miligrams
  },
  mg: {
    g: (mg) => (mg / 1000) as Grams,
    mg: (mg) => mg,
    mcg: (mg) => (mg * 1000) as MicroGrams
  },
  mcg: {
    g: (mcg) => (mcg / (1000 * 1000)) as Grams,
    mg: (mcg) => (mcg / 1000) as Miligrams,
    mcg: (mcg) => mcg
  }
};

type DosageUnitsNumerator<T extends DosageUnits> = T extends 'mcg/kg'
  ? 'mcg'
  : T extends 'mg/kg'
  ? 'mg'
  : T extends 'g/kg'
  ? 'g'
  : never;

const getDosageNumerator = <D extends DosageUnits>(dosage: D): DosageUnitsNumerator<D> => {
  return dosage.split('/')[0] as DosageUnitsNumerator<D>;
};

export const convertLiquidToDosageUnit = (
  dosageUnit: DosageUnits,
  liquid: ValueWithUnits<LiquidDosageUnits>
) => {
  // Typescript can't narrow properly here
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return LIQUID_CONVERSION_MAP[liquid.unit][getDosageNumerator(dosageUnit)](liquid.value as any);
};

export const getDosageWeightUnits = (dosageUnit: DosageUnits): WeightUnits => {
  // Note: it appears that all dosages are specified in terms of kg
  // If in the future this changes, we'll get a type error here
  switch (dosageUnit) {
    case 'g/kg':
    case 'mg/kg':
    case 'mcg/kg':
      return 'kg';
  }
};

export const calculateDosage = (
  dosage: ValueWithUnits<DosageUnits>,
  weight: ValueWithUnits<WeightUnits>
): DosageValue => {
  return (dosage.value *
    convertWeightToDosageUnits(getDosageWeightUnits(dosage.unit), weight)) as DosageValue;
};

export const calculateLiquidDosage = (
  dosage: ValueWithUnits<DosageUnits>,
  drugDosage: ValueWithUnits<LiquidDosageUnits>,
  perVolume: ValueWithUnits<LiquidVolumeUnits>
) => {
  const volumeInML = perVolume.unit === 'L' ? perVolume.value * 1000 : perVolume.value;
  return (dosage.value * volumeInML) / convertLiquidToDosageUnit(dosage.unit, drugDosage);
};
