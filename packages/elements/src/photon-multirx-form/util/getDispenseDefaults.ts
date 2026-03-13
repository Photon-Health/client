interface PackageDetail {
  packaging?: string | null;
  quantity?: string | null;
  size?: string | null;
  doseForm?: string | null;
  unitDose?: string | null;
}

export interface DispenseDefaults {
  suggestedQuantity: number | undefined;
  suggestedDispenseUnit: string | undefined;
  commonQuantities: number[];
  /** Unique dispense units derived from package data, for use as dropdown options */
  dispenseUnitOptions: string[];
}

const ALWAYS_EACH_DOSE_FORMS = new Set([
  'aerosol',
  'inhaler',
  'kit',
  'miscellaneous'
]);

function parseSize(size: string): { numericValue: number; sizeUnit: string } | undefined {
  const match = size.trim().match(/^([\d.]+)\s+(.+)$/);
  if (!match) {
    return undefined;
  }
  const numericValue = parseFloat(match[1]);
  if (isNaN(numericValue)) {
    return undefined;
  }
  return { numericValue, sizeUnit: match[2].trim().toLowerCase() };
}

function deriveFromPackageDetail(
  pd: PackageDetail,
  doseForm: string | undefined
): { dispenseQty: number; dispenseUnit: string } | undefined {
  const qty = parseInt(pd.quantity ?? '', 10);
  if (isNaN(qty) || qty <= 0) {
    return undefined;
  }

  const doseFormLower = (pd.doseForm ?? doseForm ?? '').toLowerCase();

  if (qty > 1) {
    return { dispenseQty: qty, dispenseUnit: 'Each' };
  }

  // qty === 1
  if (ALWAYS_EACH_DOSE_FORMS.has(doseFormLower)) {
    return { dispenseQty: 1, dispenseUnit: 'Each' };
  }

  const size = pd.size;
  if (!size) {
    return undefined;
  }

  const parsed = parseSize(size);
  if (!parsed) {
    return undefined;
  }

  const { numericValue, sizeUnit } = parsed;

  if (sizeUnit === 'ea') {
    return {
      dispenseQty: numericValue,
      dispenseUnit: pd.doseForm ?? doseForm ?? 'Each'
    };
  }

  if (sizeUnit === 'grams' || sizeUnit === 'gram') {
    return { dispenseQty: numericValue, dispenseUnit: 'Gram' };
  }

  if (sizeUnit === 'ml') {
    return { dispenseQty: numericValue, dispenseUnit: 'Milliliter' };
  }

  return {
    dispenseQty: numericValue,
    dispenseUnit: pd.doseForm ?? doseForm ?? 'Each'
  };
}

function isCountableOral(unit: string): boolean {
  const lower = unit.toLowerCase();
  return lower.includes('tablet') || lower.includes('capsule');
}

export function getDispenseDefaults(
  packageDetails: PackageDetail[] | undefined | null,
  doseForm: string | undefined
): DispenseDefaults {
  const empty: DispenseDefaults = {
    suggestedQuantity: undefined,
    suggestedDispenseUnit: undefined,
    commonQuantities: [],
    dispenseUnitOptions: []
  };

  if (!packageDetails || packageDetails.length === 0) {
    return empty;
  }

  const derived = packageDetails
    .map((pd) => deriveFromPackageDetail(pd, doseForm))
    .filter((d): d is { dispenseQty: number; dispenseUnit: string } => d != null);

  if (derived.length === 0) {
    return empty;
  }

  // Use the first derived unit as the canonical dispense unit
  const dispenseUnit = derived[0].dispenseUnit;

  // Collect unique dispense units for dropdown options, including packaging types (e.g., "Tube")
  const derivedUnits = new Set(derived.map((d) => d.dispenseUnit));
  const packagingUnits = new Set(
    packageDetails
      .map((pd) => pd.packaging)
      .filter((p): p is string => p != null && p.length > 0)
  );
  const uniqueUnits = [...new Set([...derivedUnits, ...packagingUnits])];

  // Collect unique quantities, sorted ascending
  const uniqueQtys = [...new Set(derived.map((d) => d.dispenseQty))].sort((a, b) => a - b);

  // Pick suggested quantity
  let suggestedQty: number;
  if (isCountableOral(dispenseUnit)) {
    // For tablets/capsules, pick closest to 30
    suggestedQty = uniqueQtys.reduce((best, q) =>
      Math.abs(q - 30) < Math.abs(best - 30) ? q : best
    );
  } else {
    // For others, pick the smallest standard size
    suggestedQty = uniqueQtys[0];
  }

  return {
    suggestedQuantity: suggestedQty,
    suggestedDispenseUnit: dispenseUnit,
    commonQuantities: uniqueQtys,
    dispenseUnitOptions: uniqueUnits
  };
}