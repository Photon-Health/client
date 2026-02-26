# Replace `photon-medication-search` Web Component with Solid.js Component

## Context

The `<photon-medication-search>` custom element is the last major Shoelace-dependent component in the prescribe workflow. It's only used internally (by `AddPrescriptionCard`) but carries web component overhead: Shadow DOM, inlined Shoelace CSS (~200KB), CustomEvent-based communication, and `any`-typed event handlers. It also has a static mobile detection bug (`window.innerWidth` checked once on mount).

This refactors it into a plain Solid.js component in `packages/components` with typed callback props, Tailwind styling, and reactive mobile detection.

## Files to Create

```
packages/components/src/
  systems/MedicationSearch/
    index.tsx                        # Orchestrator (catalog loading, search, filtering, grouping)
    MedicationSearchDesktop.tsx      # Desktop inline dropdown (replaces photon-medication-dropdown)
    MedicationSearchMobile.tsx       # Mobile fullscreen overlay (replaces photon-medication-dropdown-full-width)
    MedicationSearchItem.tsx         # Single item row renderer
    MedicationSearchGroupLabel.tsx   # Group header ("Personal Templates", etc.)
    MedicationSearchEmptyState.tsx   # Loading / no results state
    types.ts                         # All TypeScript interfaces
  utils/
    boldSubstring.tsx                # Extracted from photon-medication-search (also used by med-history dialog)
    useMediaQuery.ts                 # Reactive matchMedia hook (replaces static window.innerWidth check)
```

## Files to Modify

| File | Change |
|------|--------|
| `packages/components/src/store.ts` (lines 31-44) | Add `name` and `isPrivate` to the templates fragment |
| `packages/components/src/index.ts` | Export `MedicationSearch`, `boldSubstring`, types |
| `packages/components/package.json` | Add `@solid-primitives/scheduled`, `@tanstack/solid-virtual` |
| `packages/elements/src/photon-multirx-form/components/AddPrescriptionCard.tsx` | Replace `<photon-medication-search>` with `<MedicationSearch>` using callback props |
| `packages/elements/src/photon-add-medication-history-dialog/...` | Update `boldSubstring` import to `@photonhealth/components` |
| `packages/elements/src/index.ts` | Remove `import './photon-medication-search'` |

## Files to Delete

- `packages/elements/src/photon-medication-search/` (entire directory)
- `packages/elements/src/photon-medication-dropdown/` (entire directory)
- `packages/elements/src/photon-medication-dropdown-full-width/` (entire directory)
- `packages/elements/src/photon-dropdown/` (entire directory — legacy dummy input)
- `packages/elements/src/stores/catalog.ts` (only consumer is photon-medication-search)

## Implementation Steps

### Step 1: Dependencies & Store Update
- Add `@solid-primitives/scheduled` and `@tanstack/solid-virtual` to `packages/components/package.json`
- Add `name` and `isPrivate` fields to the `CATALOG_TREATMENTS_FIELDS` fragment in `store.ts`

### Step 2: Utilities
- Create `utils/boldSubstring.tsx` — extract from `photon-medication-search-component.tsx` lines 155-179
- Create `utils/useMediaQuery.ts` — reactive `matchMedia` hook returning a signal

### Step 3: Types
- Create `MedicationSearch/types.ts` with:
  - `MedicationSearchProps` — main component props with callback props (`onTreatmentSelected`, `onTreatmentUnselected`, `onSearchTextChanged`)
  - `TreatmentSelectedDetail` — `{ data: MedicationSearchItem, catalogId: string }`
  - `MedicationSearchDropdownProps` — shared desktop/mobile internal props with `onSelect`/`onDeselect` callbacks
  - `MedicationSearchMobileProps` — extends dropdown props with `open`/`onClose`
  - `DisableList`, `MedicationSearchGroup`, `GroupedItem`, etc.

### Step 4: Sub-components
- `MedicationSearchItem.tsx` — replaces Shoelace `<sl-menu-item>` with Tailwind div (`hover:bg-gray-100`, selected: `bg-blue-500 text-white`)
- `MedicationSearchGroupLabel.tsx` — uppercase group header, `bg-blue-50`, sticky on mobile
- `MedicationSearchEmptyState.tsx` — "Loading..." / "No treatments found"

### Step 5: Desktop Dropdown (`MedicationSearchDesktop.tsx`)
- Replaces `PhotonMedicationDropdown` from elements
- Uses `Input` + `InputGroup` + `Icon` + `Spinner` from components (no Shoelace)
- Click-outside to close (reuse existing `clickOutside` utility)
- Viewport-aware dropdown positioning (reuse `ComboBox`'s approach)
- Virtual scrolling via `@tanstack/solid-virtual` (keep `estimateSize: 36.8`, `overscan: 100`)
- 250ms debounced search via `@solid-primitives/scheduled`
- Dropdown width matches input width (no hardcoded 518px)

### Step 6: Mobile Fullscreen (`MedicationSearchMobile.tsx`)
- Replaces `PhotonMedicationDropdownFullWidth` from elements
- Fixed fullscreen overlay (`fixed inset-0 z-50 bg-white flex flex-col h-dvh`)
- **No body scroll lock on `document.body`** — the overlay is already `position: fixed; inset: 0`, so use `overflow: hidden` on the outer container + `overflow-y: auto` on the list. Eliminates the iOS Safari scroll-position jump caused by the old `body.style.position = 'fixed'` technique
- **Compact sticky header bar** combining close button + search input in a single row, so the close button is always reachable even when the soft keyboard is open
- Auto-focus input after 100ms
- Touch propagation prevention on header area only
- Virtual scrolling with `estimateSize: 42`
- **300ms debounced search** (down from 500ms) + show "Searching..." text during debounce window so users know results are coming
- Sticky group headers
- `onSelect`/`onDeselect`/`onClose` callback props (no CustomEvents)

### Step 7: Orchestrator (`MedicationSearch/index.tsx`)
- Business logic from `photon-medication-search-component.tsx`:
  - `createBlockedMedsMap`, `isTreatmentDisabled`, `getFilteredData`, `getGroupsConfig`
  - `displayTreatment`, `displayPrescriptionTemplate` (use `boldSubstring`)
  - `searchTreatmentOptions` / `loadTreatmentOptions` (GraphQL query via `usePhoton().sdk.apolloClinical`)
- Catalog loading via `usePhoton().clinical.catalog` (replaces `CatalogStore` singleton)
- Reactive mobile detection via `useMediaQuery('(max-width: 767px)')`
- **Preserve search text on close/reopen** — don't clear `searchText` when overlay closes; only clear when the user explicitly taps the clear button or selects a treatment. Prevents re-typing on accidental close
- Three render modes:
  - **Mobile trigger input** — a single readonly `Input` with `onFocus` that transitions into the fullscreen. No dummy `PhotonDropdown` component — eliminates the flash/layout shift caused by mounting/unmounting two separate components
  - Mobile fullscreen (`MedicationSearchMobile`)
  - Desktop inline (`MedicationSearchDesktop`)

### Step 8: Export & Migrate Consumer
- Export from `packages/components/src/index.ts`
- Update `AddPrescriptionCard`:
  - Replace `<photon-medication-search>` with `<MedicationSearch>`
  - kebab-case attrs → camelCase props
  - `on:photon-*` event handlers → typed callback props
  - Remove `on:photon-medication-selected` wrapper div listener (that event comes from `photon-add-medication-history-dialog`, unrelated)
- Update `photon-add-medication-history-dialog` to import `boldSubstring` from `@photonhealth/components`

### Step 9: Cleanup
- Remove old directories and `CatalogStore`
- Remove `import './photon-medication-search'` from `packages/elements/src/index.ts`
- Run `npm i` to install new deps

## Key Architectural Decisions

- **No CustomEvents**: All communication via typed Solid.js callback props
- **No Shoelace**: All UI via Tailwind + existing components (Input, InputGroup, Icon, Spinner)
- **Catalog data via `usePhoton()`**: Uses the existing `PhotonClientStore` singleton (same behavior as `CatalogStore` but already available in components)
- **Reactive mobile detection**: `matchMedia` signal instead of static `window.innerWidth` check

## Mobile UX Improvements

The old implementation has several issues that make the mobile fullscreen search frustrating. These are addressed in this migration:

| Problem | Root Cause | Fix |
|---------|-----------|-----|
| Flash/layout shift on open | Dummy `PhotonDropdown` is destroyed and replaced by `PhotonMedicationDropdownFullWidth` — two separate component trees mount/unmount | Single readonly `Input` trigger that stays mounted; fullscreen renders as an overlay on top |
| Sluggish search response | 500ms debounce with no visual feedback during the wait | Reduce to 300ms + show "Searching..." indicator during debounce window |
| Re-typing after accidental close | `onClose` clears `searchText` to empty string | Preserve search text on close; only clear on explicit clear-button tap or treatment selection |
| Close button unreachable with keyboard open | Header and input are separate rows; on small phones with keyboard up, the X button scrolls out of view | Compact single-row sticky header: `[X] [___search input___]` always pinned at top |
| iOS Safari scroll jump | Body scroll lock uses `document.body.style.position = 'fixed'` which causes a visible snap | Remove body manipulation entirely — the `fixed inset-0` overlay handles its own overflow; `overflow-y: auto` on the list, `overflow: hidden` on the container |
| Touch dead zones | `touch-action: none` + `stopPropagation` on header AND input wrapper areas kills scroll gestures that start there | Limit `touch-action: none` to only the header row (not the input); let the input area scroll naturally |

### Deferred improvements (follow-up)
- **`visualViewport` API** — detect soft keyboard height and resize the list container accordingly, maximizing visible results. Medium effort, worth doing after the initial migration is stable.
- **Swipe-down-to-close** gesture on the header — nice but adds gesture complexity and can conflict with list scrolling.

## Accessibility Improvements

The current implementation delegates a11y to Shoelace's built-in roles, which we're removing. The new component should do better:

### Desktop
- **ARIA combobox pattern**: Input gets `role="combobox"`, `aria-expanded`, `aria-controls` (pointing to listbox id), `aria-activedescendant` (pointing to focused option id)
- **Listbox and options**: Dropdown list gets `role="listbox"`, each item gets `role="option"` with `aria-selected` and `aria-disabled`
- **Keyboard navigation**: Arrow Up/Down to move through options, Enter to select, Escape to close dropdown. The old code only suppressed Space — no arrow key support existed
- **Group labels**: Use `role="group"` with `aria-label` on each group section, or `role="presentation"` on group headers so screen readers skip them as options
- **Live region for result count**: Add `aria-live="polite"` region that announces "X results" after search debounce completes, so screen readers know results changed
- **Disabled items**: `aria-disabled="true"` with the disable reason as `aria-description` so screen readers can explain why

### Mobile Fullscreen
- **Focus trap**: When fullscreen overlay opens, trap Tab focus within it (input, list items, close button). Restore focus to trigger input on close
- **Close on Escape**: Pressing Escape should close the fullscreen overlay (currently only has a close button)
- **Dialog semantics**: Fullscreen overlay gets `role="dialog"` with `aria-label="Search for treatment"` and `aria-modal="true"`
- **Auto-focus**: Input already auto-focuses after 100ms — keep this, it's good for both mobile UX and screen readers

### Shared
- **Label association**: Input should have `aria-labelledby` or be wrapped in `InputGroup` which handles `<label for>` binding
- **Error association**: When invalid, `aria-describedby` should point to the error text element (already handled by `InputGroup`)

## Verification
1. `npx nx run components:build` — verify components package builds
2. `npx nx run elements:build` — verify elements package builds
3. `npx nx run components:test` — run component tests
4. `npx nx run elements:test` — run elements tests
5. Manual testing: `npm run app` → open prescribe form → verify:
  - Desktop: type in search, see grouped results, select treatment/template, clear
  - Mobile (Chrome DevTools responsive): tap input → fullscreen opens, search, select, close
  - DoseCalculator still works (overlay above everything)
  - Disabled medications show with reason, not selectable
  - Off-catalog search triggers after 3+ chars
