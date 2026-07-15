# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Photon Health client monorepo — a healthcare platform with a clinical provider app and a patient-facing app, plus shared packages (components, SDK, elements).

## Common Commands

### Development

```bash
npm i                         # Install all dependencies
npm nx run app:pullenv        # Get env vars for clinical app (boson env)
npm run app                   # Run clinical app (boson env, with codegen watch)
npm run app:tau               # Run clinical app (local tau env)
npm nx run patient:pullenv    # Get env vars for patient app (boson env)
npm run patient               # Run patient app (boson env, with codegen watch)
npm run patient:tau           # Run patient app (local tau env)
npx nx run elements:start     # Elements dev server at localhost:3000 (no hot reload)
```

### Linting

```bash
npm run lint             # Lint all projects
npm run lint:fix         # Fix lint + prettier issues across all projects
npx nx run app:lint      # Lint clinical app only
npx nx run patient:lint  # Lint patient app only
npx nx run elements:lint # Lint elements only
```

### Testing

```bash
# Clinical app (Vitest)
npx nx run app:test                      # Run all tests
npx nx run app:test -- MyComponent       # Run single test file

# Patient app (Vitest)
npx nx run patient:test                  # Run all tests (single run)
npx nx run patient:test:watch            # Run tests in watch mode
npx nx run patient:test:ui               # Run tests with Vitest UI

# Components (Vitest)
npx nx run components:test

# Elements (Vitest)
npx nx run elements:test

# E2E (Playwright, clinical app)
npx nx run app:e2e                       # Headless
npx nx run app:e2e:ui                    # Interactive UI mode
```

### Build & Type Check

```bash
npx nx run app:build:boson               # Build clinical app (dev)
npx nx run patient:build:boson           # Build patient app (dev)
npx nx run elements:build                # Build elements library
npx nx run app:tsc:boson                 # Type check clinical app
npx nx run patient:tsc:boson             # Type check patient app
```

### GraphQL Codegen

```bash
npx nx run app:codegen                   # Generate types (boson)
npx nx run patient:codegen               # Generate types (boson)
npx nx run sdk:codegen:clinical-api      # Generate types for clinical-api (boson)
```

## Developer Tools

### Bookmarklets

Browser bookmarklets for dev/testing workflows live in `tools/bookmarklets/` as `.txt` files. To install, open the file, select all, copy, then paste into a browser bookmark's URL field.

| File | Purpose |
|------|---------|
| `patient-form-filler.txt` | Fills the `photon-patient-dialog` patient creation form with randomized test data. Prompts once for a phone number and caches it in `localStorage` under `pf_phone`. |
| `patient-form-filler-with-address.txt` | Same as above, plus fills address fields with 106 N 7th St, Brooklyn NY 11249. |
| `reset-form-localstorage.txt` | Clears the cached phone number (`pf_phone`) from `localStorage` so `patient-form-filler` will prompt again on next run. |

## Architecture

### Monorepo Structure

- **Nx 20.1.1** for workspace orchestration with npm workspaces
- **Node 20** (see `.nvmrc`)

```
apps/
  app/        — Clinical provider app (React + CRA via react-app-rewired + Webpack)
  patient/    — Patient-facing app (React + CRA via react-app-rewired)

packages/
  components/ — Solid.js + Tailwind UI component library (used by elements, NOT a web component library)
  elements/   — Web components published as @photonhealth/elements (Solid.js + solid-element)
  react/      — React SDK provider package (@photonhealth/react), used by clinical app
  sdk/        — Core JS SDK (@photonhealth/sdk), used by all packages + some external customers
  settings/   — Internal org-specific config (mail-order pharmacy mappings per environment)
```

#### `packages/components` — Solid.js UI Library

Pure **Solid.js + TypeScript** component library (private, not published to npm). This is the preferred location for UI components consumed by `packages/elements`. It contains no web components — just standard Solid.js components styled with Tailwind CSS.

- `particles/` — atomic components (Button, Input, Dialog, Badge, ComboBox, Spinner, Table, Tabs, etc.)
- `systems/` — composite domain components (PrescribeProvider, DraftPrescriptions, PharmacySearch, PatientMedHistory, DoseCalculator, RecentOrders, etc.)
- `fetch/` — GraphQL queries and mutations shared across elements
- `context.ts` / `store.ts` — Solid.js context (`PhotonContext`) and shared store used by elements via `usePhoton()`
- Has Storybook for component development: `npx nx run components:storybook`

When building new UI for Photon Elements, add Solid.js components here and compose them in `packages/elements`.

**Never import from `@photonhealth/components` (or any path into `packages/components/src`) inside `apps/app` or `apps/patient`.** Both apps use React's JSX transform (`"jsx": "react-jsx"`), while `packages/components` uses Solid's (`"jsxImportSource": "solid-js"`). Importing across that boundary causes TypeScript to type-check Solid JSX as React JSX, producing spurious errors (`class` vs `className`, `Show`/`Match` not valid JSX components, etc.). Any types that need to cross this boundary belong in `packages/sdk` — see **Shared types** in Code Conventions.

#### `packages/sdk` — Core JS SDK

Published as `@photonhealth/sdk`. Wraps the Photon GraphQL API with typed methods organized by domain:

- `clinical/` — patient, prescription, order, pharmacy, catalog, medication, allergen, prescriptionTemplate, searchMedication
- `management/` — organization, webhook, client
- `auth.ts` — Auth0 authentication (login, logout, getAccessToken, checkSession)

Also used directly by some external customers for server-side or custom integrations.

#### `packages/react` — React SDK Provider

Published as `@photonhealth/react`. Provides `PhotonProvider` and `usePhoton()` hook used extensively in the **clinical app** (`apps/app`). Wraps `@photonhealth/sdk` with React hooks that use Nanostores (`map`, `action`, `useStore`) for state management — each SDK operation gets a nanostore-backed hook (e.g. `useGetPatients`, `useCreateOrder`).

Usage in the clinical app:
```tsx
// App.tsx — provider setup
import { PhotonClient, PhotonProvider } from '@photonhealth/react';
<PhotonProvider client={client} env={env}>...</PhotonProvider>

// Any component — access SDK + auth + Apollo client
import { usePhoton } from '@photonhealth/react';
const { user, clinicalClient, isAuthenticated, getPatients, createOrder } = usePhoton();
```

The `usePhoton()` hook exposes: auth state (`user`, `isAuthenticated`, `isLoading`), the raw `clinicalClient` (Apollo), and hook-based wrappers for every SDK operation. The clinical app also imports `types` and `Env` directly from `@photonhealth/sdk` when only type information is needed.

#### `packages/settings` — Org-Specific Configuration

Internal package (`@client/settings`, private). Maps organization IDs to their configured mail-order pharmacy IDs, varying by environment (boson/neutron/photon). Used in the **clinical app** when building pharmacy selection UIs:

```tsx
import { getOrgMailOrderPharms } from '@client/settings';
const mailOrderProviders = getOrgMailOrderPharms(user?.org_id)?.provider;
```

`pharmacies.ts` exports pharmacy ID constants. Environment-specific mappings live in `lib/boson.ts`, `lib/neutron.ts`, `lib/photon.ts`.

### Key Technology Choices

- **React 18** with **React Router v6** for both apps
- **Solid.js** with **solid-element** for `packages/components` (UI library) and `packages/elements` (web components). These packages are pure Solid.js — do not use React patterns here.
- **Web Components** — `packages/elements` exports prescribe functionality as framework-agnostic custom elements, allowing external customers to embed them in any app regardless of framework (React, Vue, Angular, plain HTML, etc.).
- **Apollo Client** for GraphQL state management and caching
- **Nanostores** for lightweight shared state (`@nanostores/persistent` for persistence)
- **Chakra UI v2** as the primary UI framework (clinical app)
- **Tailwind CSS** used in components package and patient app
- **Auth0** (`@auth0/auth0-react`) for authentication
- **GraphQL Code Generator** with client preset for type-safe operations — generated types live in `gql/` or `graphql/` directories. Queries are co-located in the component file by default using `graphql()` tagged template literals; extract to a shared file only when multiple components use the same query.
- **Formik + Yup** for forms in the clinical app; **Felte + Zod** in the patient app. In `packages/elements`, forms use a custom `createFormStore` (Solid.js `createStore`) with **Superstruct** for validation — see `packages/elements/src/stores/form.ts`. In `packages/components`, prop validation uses a simple `validateProps` utility for required-prop checks. The team is consolidating on **Yup** and **Zod** for validation going forward — prefer these over Superstruct or ad-hoc validation for new code.
- **Styling**: Clinical app uses both Chakra UI and Tailwind CSS — match the surrounding code. Patient app and `packages/components` use Tailwind only.

### Environments

| Name     | Purpose          |
|----------|------------------|
| boson    | Development      |
| tau      | Local services   |
| neutron  | Staging          |
| photon   | Production       |

Environment variables for boson, neutron and photon are stored in AWS Secrets Manager. You will typically only need to pull env vars for boson for local development. `.env.tau` contains tau-specific (non-sensitive) overrides.

**Nx automatic `.env` loading:** Nx automatically loads `.env.local` (and other `.env` files) from the project root before running any target. Variables loaded first take precedence — Nx won't overwrite a variable already set in the process. This means `.env.local` values are available to all Nx targets without explicit `env-cmd` references. For example, Playwright credentials (`PLAYWRIGHT_E2E_ACCOUNT_USERNAME`, `PLAYWRIGHT_E2E_ACCOUNT_PASSWORD`) and `PLAYWRIGHT_BASE_URL` stored in `apps/app/.env.local` are automatically available when running `nx run app:e2e`.

### Backend APIs

The platform has two backend API layers. The SDK (`packages/sdk`) maintains separate Apollo clients for each:

| API | Base URL | Protocol | Purpose |
|-----|----------|----------|---------|
| **Services** | `clinical-api.{env}.health` | GraphQL + REST | Newer API — the consolidation target |
| **Lambdas** | `api.{env}.health` | GraphQL (AppSync) | Legacy API — being migrated to services |

The SDK exposes both clients (`apollo` for lambdas, `apolloClinical` for services) and uses different auth header patterns for each (`authorization` for lambdas, `x-photon-auth-token` for services).

The team is actively consolidating all APIs to **services**. The patient API is already fully on services. New features should target the services API by sending a GraphQL request through `apolloClinical`. We no longer want to wrap requests in methods like we did with the lambdas API.

### Routing

- **Clinical app** routes: `/patients`, `/prescriptions`, `/orders`, `/support`, `/settings/*`, `/login`, `/logout`
- **Patient app** routes: `/review`, `/readyBy`, `/pharmacy`, `/status`, `/canceled`, `/info`

### Photon Elements (`packages/elements`)

A library of **Solid.js web components** published to npm as `@photonhealth/elements`. Each element is registered as a custom element via `solid-element`'s `customElement()` and can be used as standard HTML tags in any framework. They are both consumed by external customers via npm and used directly in the clinical app.

**Design philosophy:** Only high-level, feature-complete workflows should be web components. The package contains many generic/primitive elements (inputs, dropdowns, dialogs, etc.) that are **deprecated** and not used by external customers — these exist only as internal building blocks or legacy code. The two publicly consumed elements are:

- `<photon-prescribe-workflow>` (and its wrapper `<photon-multirx-form-wrapper>`) — the prescribing workflow
- `<photon-med-history>` — patient medication history

New web components should only be created for substantial functionality intended for external customer use on npm. Do not add new generic/primitive web components.

**How it works:**

- Each element lives in its own directory (e.g. `src/photon-multirx-form/`) with an `index.ts` that re-exports the component
- Components are written in Solid.js TSX, then registered as custom elements with `customElement('photon-tag-name', defaultProps, Component)`
- HTML attributes use kebab-case (e.g. `patient-id`, `enable-med-history`) which map to camelCase props in the Solid component
- `src/index.ts` imports all elements as side effects, so `import '@photonhealth/elements'` registers every custom element
- Built with Vite as a library (`photon-webcomponents`), outputting ES and CJS bundles
- Depends on `@photonhealth/components` (Solid.js UI primitives + Tailwind) and `@photonhealth/sdk` (PhotonClient)
- Uses Shoelace web components for some UI primitives (alerts, icons, switches) — **Shoelace is deprecated**; prefer Tailwind-based components in `packages/components` for new code
- Styles are inlined via CSS module imports (`?inline`) since web components use Shadow DOM

**Key elements:**

| Element | Consumer | Purpose |
|---------|----------|---------|
| `<photon-client>` | External | Root wrapper — initializes `PhotonClient` SDK, Auth0 auth, and provides context to all child elements |
| `<photon-prescribe-workflow>` | External | Core prescribe form — the main customer-facing element |
| `<photon-multirx-form-wrapper>` | Internal | Wraps `<photon-prescribe-workflow>` with dialog/order UI for the clinical app |
| `<photon-med-history>` | External | Patient medication history |
| `<photon-patient-dialog>` | Deprecated | Create/edit patient dialog (internal use only) |
| `<photon-patient-select>`, `<photon-text-input>`, etc. | Deprecated | Generic primitives (internal use only, not for external customers) |

**Communication pattern — CustomEvents:**

Elements communicate with host apps (and each other) via bubbling `CustomEvent`s dispatched with `composed: true, bubbles: true` so they cross Shadow DOM boundaries. The clinical app listens on the element ref:

```tsx
// In clinical app (React) — PrescriptionForm.tsx
ref.current.addEventListener('photon-prescriptions-created', (e: any) => {
  // e.detail contains { patientId, prescriptionIds, createOrder }
});
ref.current.addEventListener('photon-prescriptions-closed', () => { ... });
```

Key events:
- `photon-prescriptions-created` — prescriptions saved (detail: `{ patientId, prescriptionIds, createOrder }`)
- `photon-prescriptions-closed` — form dismissed
- `photon-patient-created` — new patient created (detail: `{ patientId, createPrescription }`)
- `photon-patient-updated` — patient edited (detail: `{ patientId, createPrescription }`)
- `photon-patient-closed` — patient dialog dismissed
- `photon-order-created` — order created (detail: `{ order: { id } }`)
- `photon-order-combined` — order combined with existing (detail: `{ order: { id } }`)
- `photon-datadog-action` — forward Datadog RUM actions to host (detail: `{ action, data }`)

**Usage in the clinical app:**

The clinical app imports `@photonhealth/elements` once in `apps/app/src/index.tsx` to register all custom elements. It wraps the app in `<photon-client>` (in `Main.tsx`) and then uses elements as JSX tags with a `ref` for event listeners. TypeScript support requires declaring the tag in `JSX.IntrinsicElements`:

```tsx
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'photon-multirx-form-wrapper': unknown;
    }
  }
}
```

**State management inside elements:**

- `stores/` directory contains Solid.js stores (`createStore`) for cross-element shared state: `PatientStore` (singleton), `createFormStore` (per-instance factory using `superstruct` for validation), `CatalogStore`, `DispenseUnitStore`
- The `<photon-client>` element provides `PhotonContext` (Solid context) with the SDK client to all child elements via `usePhoton()`

### Analytics

Analytics applies only to the clinical and patient apps — **not** to `packages/elements` published to npm. Adding analytics to elements is not feasible because it can conflict with customer web applications (e.g. Datadog RUM uses a singleton pattern). Both apps use **RudderStack** for product analytics and **Datadog RUM** for monitoring/session replay. The two systems serve different purposes and are set up differently per app.

#### Clinical App (`apps/app`)

**RudderStack (event tracking):** Uses a React context provider pattern.

- `ProviderAnalyticsProvider` (`src/hooks/useProviderAnalytics.tsx`) wraps the app and auto-fetches user/org context via a GraphQL `me` + `organization` query
- In components, use the `useProviderAnalytics` hook:
  ```tsx
  const { track } = useProviderAnalytics();
  track('prescription_form_opened', { patientId });
  ```
- Context data (providerId, orgId, orgName, environment, etc.) is automatically injected into every `track` call
- The underlying `ProviderAnalytics` class (`src/configs/providerAnalytics.ts`) is a lazy singleton accessed via `getProviderAnalytics()` — use the hook in components, use `getProviderAnalytics()` only outside React
- For pre-auth tracking (e.g. self-signup), use `trackSelfSignupEvent()` from `src/configs/analytics.ts` which posts directly to the `/auth0/track-event` REST endpoint

**Datadog RUM:** Initialized in `src/instrumentation/index.ts` via `initializeInstrumentation()`. User context (org, email) is set via `setInstrumentationUserContext()` which is called automatically by `ProviderAnalyticsProvider` when the user authenticates.

**Prescribe Workflow Analytics (Embed Events):** The prescribe workflow lives in Solid.js web components (`packages/elements`, `packages/components`), which cannot call RudderStack directly (they're published to npm and must not bundle customer-conflicting singletons). Instead, analytics events bubble up as CustomEvents through Shadow DOM to the React clinical app, which forwards them to RudderStack.

*Event categories and types* — defined in `packages/sdk/src/analytics/clinicalAnalyticsTypes.ts`:

| Category | Type | Description |
|----------|------|-------------|
| `pageViewed` | `PageViewEvent` | Page/view lifecycle — each variant has a unique `name` (e.g. "New Prescriptions Page Viewed", "Signature Attestation Page Viewed") |
| `ctaClicked` | `CtaClickEvent` | Call-to-action clicks — each variant has a unique descriptive `name` |
| `fieldInteraction` | `FieldInteractionEvent` | Form field completeness — all share `name: 'Field Interaction'` with `formName`, `fieldName`, `hasValue`, `isOptional` |

CTA click events have two sub-types:
CTA event names: "Patient Created", "Patient Updated", "Order Sent", "Prescriptions Activated", "Signature Attestation Agreed", "Signature Attestation Canceled", "Order Canceled", "Draft Prescription Added", "Draft Prescription Edited", "Draft Prescription Deleted", "Added To Medication History", "Combine Orders Confirmed", "Combine Orders Rejected", "Screening Alert Acknowledged", "Screening Alert Canceled", "Pharmacy Selected".

*Type-safe dispatch* — `AnalyticsEventMap` (in the SDK) maps each `AnalyticsCategory` to its event type. The generic function `dispatchAnalyticsTrackEvent<C>(category, event)` enforces that the category and event type are always coupled at compile time.

*Dispatch mechanism* — `PrescribeEventDispatchProvider` (`packages/components/src/systems/PrescribeEventDispatchProvider.tsx`) is a Solid.js context provider that wraps a `<div ref={ref}>`. It exposes `dispatchAnalyticsTrackEvent` (which closes over the ref) via `usePrescribeEventDispatch()`. Consumers call it like:
```tsx
const { dispatchAnalyticsTrackEvent } = usePrescribeEventDispatch();
dispatchAnalyticsTrackEvent('ctaClicked', { name: 'Order Sent', buttonText: 'Send', ... });
dispatchAnalyticsTrackEvent('fieldInteraction', { name: 'Field Interaction', formName: '...', ... });
dispatchAnalyticsTrackEvent('pageViewed', { name: 'New Prescriptions Page Viewed', ... });
```
This dispatches a `photon-analytics-track-event` CustomEvent (`composed: true, bubbles: true`) with `detail: { ...event, category, timestamp }`.

*Listener side* — React form components (`PatientForm`, `UpdatePatientForm`, `PrescriptionForm` in `apps/app/src/views/routes/`) listen on the element ref via `addEventListener('photon-analytics-track-event', ...)`. The handler calls `trackAnalyticsEvent()` (`src/instrumentation/analyticsTrackEventListenerUtils.ts`) which extracts the `name` field as the RudderStack event name and flattens any field snapshot properties with a `snap_` prefix (e.g. `{ firstName: { completed: true } }` → `{ snap_first_name: true }`).

*Field snapshots* — `buildFieldSnapshot()` and `buildPrescriptionSnapshot()` (`packages/components/src/analytics/buildFieldSnapshot.ts`) capture form completeness state. `PATIENT_FORM_FIELDS` and `DRAFT_PRESCRIPTION_FORM_FIELDS` define which fields are tracked. These snapshots are included in CTA click events (e.g. "Patient Created", "draft prescription added") as the `fields` property.

*Key files:*

| File | Purpose |
|------|---------|
| `packages/sdk/src/analytics/clinicalAnalyticsTypes.ts` | Event type definitions (`AnalyticsCategory`, `AnalyticsEventMap`, `PageViewEvent`, `CtaClickEvent`, `FieldInteractionEvent`) |
| `packages/components/src/analytics/dispatchAnalyticsTrackEvent.ts` | Generic dispatch function — creates and fires the CustomEvent |
| `packages/components/src/analytics/buildFieldSnapshot.ts` | Field snapshot utilities and form field constants |
| `packages/components/src/systems/PrescribeEventDispatchProvider.tsx` | Solid.js context provider exposing `dispatchAnalyticsTrackEvent` via `usePrescribeEventDispatch()` |
| `apps/app/src/instrumentation/analyticsTrackEventListenerUtils.ts` | Listener-side event-to-RudderStack mapping and field snapshot flattening |

#### Patient App (`apps/patient`)

**RudderStack:** Uses a singleton `patientAnalytics` instance exported from `src/configs/analytics.ts`.

- `PatientAnalytics` class provides three methods:
  - `page(category, name?, properties?)` — track page views
  - `track(eventName, order, properties?)` — track events; automatically maps the `Order` object into rich context data (patient, org, pharmacy, fulfillments, medications, discount cards)
  - `identify({ userId, address, orgId, orgName })` — identify user and group by org
- For page tracking, use the `usePageAnalytics` hook (`src/hooks/usePageAnalytics.ts`):
  ```tsx
  usePageAnalytics({ pageName: "Patient's Ready By Time" });
  ```
  This calls `patientAnalytics.page()` once on mount with order context auto-included.
- For event tracking, import the singleton directly:
  ```tsx
  import { patientAnalytics } from '../configs/analytics';
  patientAnalytics.track('Pharmacy Selected', order, { pharmacyId });
  ```
- The `order` parameter is required for `track()` — it enriches every event with patient, org, pharmacy, and medication data via `mapOrderToContextData()`

## Known Tech Debt

### Elements stores lack type safety

`packages/elements/src/stores/form.ts` uses `Record<string, any>` for form values and `any` for store values throughout. The `createFormStore` factory has no generics — all form field access is untyped, so consumers rely on string keys with no compile-time checking. The `PatientStore` in `stores/patient.ts` is better typed but still uses broad SDK types without narrowing. Event handlers across element components (e.g. `photon-multirx-form-wrapper`, `photon-patient-dialog`) also use `any` for CustomEvent details rather than typed event interfaces.

### Medication search/dropdown are unnecessarily web components

`photon-medication-search` is registered as a custom element (`customElement('photon-medication-search', ...)`) even though no external customer uses it directly — it's only consumed internally by `AddPrescriptionCard` inside the prescribe workflow. The related `photon-medication-dropdown` and `photon-medication-dropdown-full-width` are already plain Solid.js components (not registered as custom elements), but `photon-medication-search` still carries the web component overhead (Shadow DOM, inline CSS, Shoelace dependencies, kebab-case attribute API). It should be refactored to a plain Solid.js/TypeScript component in `packages/components` and imported directly, matching the approach used by the dropdown components it depends on.

### Refactoring deprecated elements

When migrating a deprecated element to a plain Solid.js component, use an incremental approach: first create the new component in `packages/components` alongside the old element, then migrate consumers one at a time, and finally remove the old `customElement()` registration and its directory from `packages/elements`.

### Deprecated elements still bundled

All deprecated primitive elements (`photon-text-input`, `photon-checkbox`, `photon-dropdown`, `photon-patient-select`, etc.) are still imported in `packages/elements/src/index.ts` and included in the production bundle. Since they're only used internally as building blocks, they could be converted to plain Solid.js components in `packages/components` and removed from the web component registry to reduce bundle size.

### SDK codegen is incomplete and GraphQL documents are scattered

The `packages/sdk` package has codegen set up against `clinical-api` (run via `npx nx run sdk:codegen:clinical-api`), but there is no codegen support for the lambdas API. As a result, type-safe generated hooks and operation types only exist for `clinical-api` operations; lambdas operations remain hand-typed through `sdk/src/types.ts`.

All GraphQL documents (queries, mutations, fragments) in the SDK should live in `sdk/src/graphql/clinical-api/`, with the hope that one day we'll also have an `sdk/src/graphql/api/` folder. Documents are currently scattered across individual domain files. When adding new operations or refactoring existing ones, move GraphQL documents into `sdk/src/graphql/clinical-api/` and run `npx nx run sdk:codegen:clinical-api` to regenerate types.

GraphQL documents in the clinical app (`apps/app`) should also eventually leverage types in the SDK.

### CustomEvent types are untyped at the boundary

The React clinical app listens for element events with `addEventListener` and types all event payloads as `any` (e.g. `(e: any) => { e.detail.patientId }`). There are no shared TypeScript interfaces for event detail shapes, making the React-to-Solid boundary fragile.

## Automated Tests

### Test Frameworks

| Project | Framework | Runner |
|---------|-----------|--------|
| Clinical app (`apps/app`) | Vitest + React Testing Library | `npx nx run app:test` |
| Patient app (`apps/patient`) | Vitest + React Testing Library | `npx nx run patient:test` |
| Components (`packages/components`) | Vitest + Solid Testing Library | `npx nx run components:test` |
| Elements (`packages/elements`) | Vitest | `npx nx run elements:test` |
| E2E (`apps/app/e2e`) | Playwright | `npx nx run app:e2e` |

### Test Types and Patterns

**E2E tests** (`apps/app/e2e/`) — Playwright tests that run against a live dev server. Auth is handled via a setup project (`auth.setup.ts`) that logs in through the Auth0 UI and persists storage state to `e2e/.auth/user.json`. Specs then reuse that auth state. Config is in `apps/app/playwright.config.ts`; the base URL comes from `PLAYWRIGHT_BASE_URL` env var, and credentials from `PLAYWRIGHT_E2E_ACCOUNT_USERNAME`/`PLAYWRIGHT_E2E_ACCOUNT_PASSWORD`.

**Page/integration tests** (`apps/patient/src/views/*.test.tsx`, `Navigation.test.tsx`) — render full page components with `createMemoryRouter` + `RouterProvider` and test user flows across route transitions. These mock the API layer (`vi.mock('../api')`), GraphQL client, analytics, and heavy child components, then assert on screen content and navigation behavior. They use test data generators from `src/test-utils/generators.ts` which provide factory functions like `generateOrder()`, `generatePatient()`, `generateFill()`, etc. with sensible defaults and `Partial<>` overrides.

**Unit tests** (`apps/patient/src/utils/*.test.ts`, `packages/components/src/**/**.test.ts`) — pure function tests with no rendering. Test files sit alongside their source files. Examples: `formatters.test.ts`, `conversionFactors.test.ts`, `deliveryPromise.test.ts`.

**Component tests** (`packages/components/src/**/*.test.tsx`) — Solid.js component tests using `@solidjs/testing-library`. Test individual UI components like `ComboBox`, `Input`, `PharmacySelect`, `PatientMedHistory`, and `DoseCalculator`.

**Hook tests** (`apps/patient/src/hooks/*.test.tsx`) — test React hooks in isolation using `renderHook` patterns.

### Test Expectations

All new utility functions, views, and components must include tests. Match the test type to the code:
- New utility/helper functions → unit tests
- New patient app views → page-level integration tests (with mocked API/analytics/router)
- New clinical app views → React Testing Library tests with MSW for API mocking, following the same patterns as patient app tests. Also expand Playwright E2E coverage for critical user flows.
- New Solid.js components in `packages/components` → component tests with `@solidjs/testing-library`
- New React hooks → hook tests with `renderHook`

### Test Conventions

- Keep tests **brief and focused**. For unit tests of pure functions, prefer single-assertion, bite-sized tests. For page-level and integration tests that interact with rendered UI, longer tests with multiple assertions are fine.
- Use **fuzzy matching** assertions where possible (e.g. `toHaveTextContent`, `toMatch`, `expect.objectContaining`) to avoid brittle tests that break on insignificant changes.
- Prefer **`@testing-library`** (`@testing-library/react`, `@solidjs/testing-library`) for unit and component tests — query by role/text, not implementation details.
- **Mocking**: Prefer **MSW** (`msw`) for API mocking — the clinical app has shared default handlers in `@photonhealth/sdk/test-utils` (see `order-workflow-analytics.test.tsx` for the established pattern). Use `vi.mock` only when MSW can't cover the case (e.g. mocking non-HTTP modules, auth state, or third-party libraries that are difficult to render). Avoid mocks when possible.
- **Component vs. page-level tests**: When adding tests for a component, ask the engineer whether the component is complex enough to warrant isolated component tests, or if it can be implicitly covered by a page-level test that exercises it in context.
- Test files use `.test.ts` or `.test.tsx` extension and live alongside source files
- Test files are excluded from ESLint (configured in `.eslintrc.json` ignorePatterns)
- Patient app has a shared `setupTests.ts` that globally mocks `react-ga4`, `@datadog/browser-rum`, `@client/settings`, and polyfills `IntersectionObserver`
- Patient app tests use `vi.mock()` to stub API modules, analytics, and heavy components before rendering
- Test data generators (`apps/patient/src/test-utils/generators.ts`) use a factory pattern: `generateOrder({ state: 'ROUTING' })` creates a full order with defaults, overridden by the partial you pass in

## Code Conventions

- **Prettier**: 2-space indent, 100 char width, single quotes, semicolons, no trailing commas
- **ESLint**: `@typescript-eslint/recommended`, unused vars error (prefix `_` to ignore), `no-explicit-any` warns, React Hooks rules enforced
- **Pre-commit hooks**: Husky + lint-staged runs ESLint and Prettier on staged files
- **Test files** are excluded from linting (configured in `.eslintrc.json` ignorePatterns)
- **TypeScript strict mode** enabled; type check with `npx nx run <project>:tsc:boson`
- **Shared types** belong in `packages/sdk/src/types.ts` since all packages already depend on `@photonhealth/sdk`. For GraphQL response shapes, always use generated types from codegen (`gql/` or `graphql/` directories) rather than defining them manually.

## Date Formatting

Always use standardaized `formatDate*` utils — never format dates inline with `toLocaleDateString`, `toISOString`, `date-fns`, `dayjs`, or `Intl.DateTimeFormat`.

NOTE: The code in `apps/app/patient` does not currently use formatting utils, and should not be taken as an example of standardized patterns.

| Function | Use when |
|----------|----------|
| `formatDate(date?)` | Timestamps — fields that record *when an event occurred* (e.g. `createdAt`, `writtenAt`) |
| `formatDateUTC(date?)` | Dates that should display literally as stored, not shifted to the user's timezone (e.g. `dateOfBirth`) |
| `formatDateLong(date?)` | Same as `formatDate` but long-form month name |
| `formatDateLongUTC(date?)` | Same as `formatDateUTC` but long-form month name |

**Why UTC for certain dates?** Some dates should be shown exactly as stored regardless of the user's timezone — e.g. a date of birth of January 15 should always display as January 15. Without `timeZone: 'UTC'`, the API value `2024-01-15T00:00:00Z` renders as January 14 for users in timezones behind UTC.

**Why local timezone for order and prescription related dates?** Fields like `createdAt` represent a moment in time and should appear in the user's local time so they match the user's clock.
