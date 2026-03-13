---
name: Smart Dispense Defaults from Package Data
description: Plan and implementation status for auto-filling dispense unit + quantity from Medispan packageDetails on treatment selection
type: project
---

## Smart Dispense Defaults from Medispan Package Data

**Why:** Prescribers previously had to manually select dispense units from a global list of ~100+ options. The backend now returns `doseForms` and `packageDetails` on the `Medication` type via the treatments query, enabling the frontend to auto-fill quantity and dispense unit intelligently.

**How to apply:** When modifying the prescribe workflow, medication search, or dispense unit logic, reference this plan for context on the data flow and design decisions.

## What Was Done

### 1. GraphQL Query Updates
- **File:** `packages/sdk/src/graphql/clinical-api/query.ts`
- Added `... on Medication { doseForms { name }, packageDetails { packaging, quantity, size, doseForm, unitDose } }` to both `SearchTreatmentsQuery` and `SearchTreatmentOptionsQuery`
- Codegen regenerated against tau (`npx nx run sdk:codegen:clinical-api:tau`)
- **Note:** `doseForms` returns `[DispenseUnit!]` (objects with `name`), not plain strings

### 2. New Utility: `getDispenseDefaults.ts`
- **File:** `packages/elements/src/photon-multirx-form/util/getDispenseDefaults.ts`
- Derives smart quantity + dispense unit from `packageDetails`
- Decision tree:
  - `quantity > 1` → multi-unit package → dispenseQty=quantity, unit="Each"
  - `quantity == 1` + aerosol/inhaler/kit → qty=1, unit="Each"
  - `quantity == 1` + size="30 ea" → qty=30, unit=doseForm (e.g., "Capsule")
  - `quantity == 1` + size="45 grams" → qty=45, unit="Gram"
  - `quantity == 1` + size="150 mL" → qty=150, unit="Milliliter"
- For tablets/capsules: suggests quantity closest to 30
- For others: suggests smallest standard size
- Returns `dispenseUnitOptions`: unique derived units + unique packaging values (e.g., "Tube")

### 3. DispenseUnitSelect Component Updated
- **File:** `packages/components/src/particles/DispenseUnitSelect/index.tsx`
- Added `options?: string[]` prop — when provided, shows those instead of the global dispense units list
- Falls back to global `getDispenseUnits()` for compounds/medical equipment with no package data
- Disabled when only 1 option available

### 4. AddPrescriptionCard Updated
- **File:** `packages/elements/src/photon-multirx-form/components/AddPrescriptionCard.tsx`
- On treatment selection (non-template): calls `getDispenseDefaults()`, auto-fills quantity and dispense unit
- Passes derived `dispenseUnitOptions` to `DispenseUnitSelect`
- Clears options on treatment unselect
- Template selection still uses `repopulateForm` (unchanged)

### 5. Nx Build Chain for Tau
- Added `build:tau` targets to: `sdk`, `elements`, `react`, `components`, `settings`
- `sdk:build:tau` depends on `codegen:clinical-api:tau` (uses tau schema)
- `app:start:tau` and `app:dev:tau` depend on `^build:tau` instead of `^build`
- **Why:** `doseForms` field only exists on tau schema until deployed to boson. Without this, `^build` triggers `sdk:codegen:clinical-api` (boson) which fails validation.

## Key Design Decisions

1. **Dispense unit options come from package data, not `doseForms`** — `doseForms` returns pharmaceutical form names (e.g., "Cream") which aren't always valid dispense units. Package-derived units (e.g., "Gram", "Tube") are more appropriate.

2. **Packaging values included as options** — e.g., "Tube" from `packaging: "Tube"` is added alongside derived units like "Gram" so prescribers can choose either.

3. **Auto-select first option** — when a treatment is selected, the first derived dispense unit is auto-selected. If only 1 option, the dropdown is disabled.

4. **Backward compatible** — compounds/medical equipment without `packageDetails` fall back to the global dispense units list.

5. **`dispenseUnit` still sent as `String`** — the `createPrescription` mutation still takes `dispenseUnit: String!`. Backend maps to IDs.

## Files Changed

- `packages/sdk/src/graphql/clinical-api/query.ts`
- `packages/sdk/src/graphql/clinical-api/gql/` (regenerated)
- `packages/sdk/project.json` (added `build:tau`)
- `packages/components/src/particles/DispenseUnitSelect/index.tsx`
- `packages/elements/src/photon-multirx-form/util/getDispenseDefaults.ts` (new)
- `packages/elements/src/photon-multirx-form/components/AddPrescriptionCard.tsx`
- `packages/elements/project.json` (added `build:tau`)
- `packages/react/project.json` (added `build:tau`)
- `packages/components/project.json` (added `build:tau`)
- `packages/settings/project.json` (added `build:tau`)
- `apps/app/project.json` (tau targets use `^build:tau`)

## Remaining / Future Work

- Deploy `doseForms` + `packageDetails` fields to boson schema so regular `^build` works
- Remove `build:tau` targets once boson schema is updated
- Consider adding `packageDetails` to the catalog query so catalog treatments also get smart defaults (currently only off-catalog search treatments have it)
- Eventually deprecate and remove the global `getDispenseUnits()` API call
- Add tests for `getDispenseDefaults` utility
