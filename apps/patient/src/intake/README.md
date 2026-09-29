# Patient intake

Self-contained condition-specific intake flow. A patient arrives directly (not
through an org), verifies against an existing Photon record, answers a short
hardcoded questionnaire, and produces a **draft order** under the MASTER org.

## Lift-out contract

This directory imports only npm packages and its own files. The single seam is
one line in `src/Routes.tsx` mounting `intakeRouteElements`. Moving this to a
standalone site is a directory copy plus a router mount — do not import from
`../api`, `../configs`, `../components`, or `../hooks`.

UI comes from `@photon-health/ui` and `@photon-health/tokens`. `routes.tsx`
loads `tokens.css`, `fonts.css` and the `ui` stylesheet, so the seam stays one
route mount — nothing is imported into the app's entry point. Chakra is
deliberately avoided so the tree carries no theme dependency; the design system
tokens are variables and type classes with no reset, so they do not leak into
the Chakra views either.

`intake.css` is what remains after that — only the page shell and the three
things the design system has no component for. All classes are prefixed
`intake__` and every value is a semantic token.

## Environment

```
VITE_INTAKE_FAKE_OTP=true              # required; the 6-digit code is cosmetic
VITE_NETWORK_API_ENDPOINT=...          # network-api /graphql
VITE_INTAKE_MACHINE_TOKEN=...          # Auth0 M2M token with the MASTER org claim
VITE_INTAKE_API_PROXY_PATH=/api/intake # optional; when set, the token is NOT read client-side
VITE_INTAKE_TRUST_TOP_MATCH=true        # WORKAROUND; skips identity verification
```

Set `VITE_INTAKE_API_PROXY_PATH` to keep the M2M token out of the bundle — the
proxy attaches `x-photon-auth-token` server-side. Without it the token is read
from env and ships in the bundle, which is only acceptable for a throwaway
boson credential.

`VITE_INTAKE_TRUST_TOP_MATCH` is a workaround for the matcher, not a feature.
Demographic matching currently returns only the PHONE signal even when the last
name and date of birth are right, so every lookup dead-ends as AMBIGUOUS. With
the flag on, an ambiguous result takes the **first candidate** and re-reads it
by id — which means the flow can hand one person another patient's medication
history. It carries the same bar as `VITE_INTAKE_FAKE_OTP`: local demos only.
Remove it once matching is fixed.

`VITE_INTAKE_FAKE_OTP` must be unset anywhere the flow is publicly reachable.
Nothing verifies the code, so with it on, phone + last name + date of birth
returns that patient's medication history.

## Routes

`/start/:condition` → `index` landing, `eligibility`, `verify` (phone),
`verify/code`, `verify/details`, `verify/profile`, `history`, `questions`,
`medication`, `review`, `location`, `pharmacy`, `submitted`, `unresolved`.

`location` is the zip screen. `review` routes there instead of `pharmacy` when
the patient record carries no postal code — always the case for a patient
created at `verify/profile`, since that screen collects no address.

Step 1 is phone → code → last name + DOB, then it branches:

| Lookup result | Goes to |
|---|---|
| matched | `history` — welcome back, real medication history |
| not found | `verify/profile` — create the patient, then straight to `questions` |
| ambiguous | `unresolved` — dead-end |

The code screen accepts any six digits. Last name and DOB are on their own
screen because matching needs two signals and phone alone scores one; the
wireframes assume phone-only identification, which cannot auto-match.

Ambiguous does not fall through to profile creation on purpose — a second
record for someone who already has one splits their medication history across
two patient rows.

Conditions live in `conditions/`. Adding one is a new config object plus an
entry in `conditions/index.ts` — no component changes.

### The step spine

A flow declares `steps: StepKey[]`, and a screen asks the flow where it sits
rather than hardcoding "step 2 of 4". The key is also the route segment.

| Flow | Steps |
|---|---|
| `ella` | `verify` → `questions` → `review` → `pharmacy` |
| `glp1` | `eligibility` → `questions` → `verify` → `medication` → `review` → `pharmacy` |

`stepNumber`, `pathToFirstStep`, `pathAfterStep` and `pathBeforeStep` in
`conditions/index.ts` are the only places that know the order. That is what
lets glp1 screen before it identifies anyone, and what lets it meter six.

A screen keyed to a step a flow does not declare is unreachable by
construction, and redirects if it is reached directly — `eligibility` and
`medication` both guard on their config being present.

### Screens a condition opts into

| Config | Screen | What it adds |
|---|---|---|
| `eligibility` | `Eligibility` | Height, weight, BMI and weight-related conditions |
| `questionsHeading` | `HealthHistory` | A page heading, so each prompt can name its own option set |
| `Question.horizontal` | `HealthHistory` | Yes / No side by side rather than stacked |
| `medicationChoice` | `MedicationChoice` | A medication preference, which can carry its own `Treatment` |
| `landing` | `Landing` | Medications, how-it-works, pricing and a closing band under the hero |
| `stats` | `Landing` | The stats table, with the call to action pinned to the bottom |

`glp1`'s clinical copy is written but its review fee and both NDCs are
placeholders, marked at each use site. Without an NDC a treatment falls back
to a MediSpan name match — see the note on `Treatment.name`.

### GLP-1 specifics

- **The screener does not gate.** A BMI under the threshold shows "May not
  meet criteria" and still continues; the provider review is the gate, and
  the comps give no dead-end screen for it. `unresolved` is about an ambiguous
  identity match, so it is not that screen.
- **The medication choice is a preference, not a decision** — which is what
  the screen says. It does pick the drug that gets drafted
  (`resolveTreatment`), because a draft needs one drug; "let my provider
  recommend" drafts the condition's default.
- **Step 3 is identity.** The comps number eligibility 1, health history 2 and
  medication 4 and leave 3 unlabelled; verification is what this flow has to
  put there. If 3 is meant to be the coverage check from the landing page,
  that is a new screen and a new step key, not a renumbering.

## API calls

All through network-api as a MACHINE principal.

| Step | Call |
|---|---|
| verify/details | `patient` mutation, demographic match on phone + last name + DOB |
| verify/profile | `patient` mutation with a full demographic — creates the patient and links it to MASTER in one transaction |
| history | `clinical.medications` off the same payload |
| review | `prescription` mutation — no prescriber, no signature |
| location | none — the zip is held in memory until the pharmacy step |
| pharmacy | `order` mutation with `pharmacy.near.address.postalCode`, then with `pharmacy.id` |

Candidates come back capped at 20 with no cursor, so the pharmacy screen pages
them client-side: 10 cards, then "Show more pharmacies". Each candidate carries
its own record (`PharmacyChangeOption.pharmacy` + `distanceMiles`), which needs
the network-api change on the `phungus` branch — against an older network-api
the cards still render, without address or hours.

## Design system gaps

Where `@photon-health/ui` had no component, the flow got unblocked in app code
rather than forking or overriding one. Each is marked at its use site.

| What was needed | What the system gave | What this does instead |
|---|---|---|
| Step meter across the four steps | nothing | `.intake__progress`, four token-styled bars |
| One-time-code entry (6 boxes) | nothing; `Input`'s field shell is not exported for wrapping a custom control | `CodeInput` + `.intake__code-box`, chrome copied from `Input`; its own arrow/paste key handling, against rule 4 |
| Request status timeline | nothing | `.intake__timeline-*` inside a `Card` |
| Radio option with secondary text | `RadioOption` is `{ value, label }` only — no `description`/`meta`, unlike `SelectOption`/`ComboboxOption` | a pharmacy's `reason` is concatenated into the label |
| Pharmacy chosen from a list | `PharmacyCard` wants address, hours and prices this flow never fetches, and collapsed carries no selection affordance | `RadioGroup` |
| Radio group labelled by an existing heading | `RadioGroup` takes `label` but has no `aria-labelledby` and no visually-hidden option | the question prompt is the group's own label; the screen's `h1` is "Health history" |
| Date of birth | no date picker | `Input type="date"` |
| Eyebrow / metadata type step | the app scale has no eyebrow step and sets tracking `0` on every step; `type-brand-eyebrow` is the only eyebrow in the system and is marketing-only | `.intake__eyebrow` takes size and weight from `type-app-small-semibold` and overrides family, case and tracking to `--font-mono` (GT Pressura Mono) / uppercase / `0.08em`, per the comps |
| A font on `Button` | `Button`'s base is `font-medium text-[14px]` with no `font-family`, and a `<button>` inherits none from an ancestor — so every button rendered in the UA's Arial while the prose beside it was Acid Grotesk. `Input`/`Select`/`Tag` carry `type-app-*` classes and are fine | `.intake button, input, select, textarea { font-family: inherit }`, scoped to the flow |
| Full-width button | `Button` has no `fullWidth` | `Stack`'s default `align="stretch"` |
| Spinner on a submitting button | `loading` shows the spinner but does not disable | `disabled` passed alongside `loading` |
| Colour utilities in a non-Tailwind app | `tokens.css` ships the `type-app-*` classes but no colour utilities; `text-[var(--text-*)]` only works because `ui/styles.css` happens to contain the ones the system itself uses | those three are used and nothing else is assumed |
| Informational status pill | `Tag` has no `info`/`neutral` tone — its four tones are marketplace questions, and an unknown tone throws rather than falling back | `Badge tone="info"`, which is the record-status component |
| Radio group named by an existing heading | `RadioGroup` names its group only through its own visible `label` — no `aria-labelledby`, no hidden-label option, and no `className` to apply the bundled `.sr-only` | the question is the heading, per the comps, and the group goes unnamed for assistive tech |
| A selectable pharmacy card | `PharmacyCard` has no selected state and takes no `onClick`, `className` or rest props | a collapsed card is wrapped in a `<button>`; safe only because collapsed holds nothing interactive |
| Hours in the shape `PharmacyCard` wants | network-api returns `hours` / `isOpen` / `nextEvents`; `HoursProps` wants `{ state, detail }` | `pharmacyDetails.ts` derives it, porting `derivePharmacyOpenState` and `formatAddress` from `src/utils/` by copy — the lift-out contract forbids importing them |
| Typed network-api documents | no codegen targets network-api — `apps/patient/codegen.ts` points at patient-api only | every document here is a hand-written string with hand-written response types, so a bad field fails at runtime, not at build |
| `data-*` on a layout primitive | `Row`/`Stack` take `className` but no rest props | plain elements for the timeline rows |
| Height in feet and inches | no composite measurement input, and `Input` owns its own label | two `Input`s with `affix` under one shared `type-app-input-label`, each named for assistive tech |
| A bordered, selectable checkbox row | `Checkbox` renders a control and a label, and takes no `className` | the row is a `Card selected={…}`, the system's own selected surface |
| Numbered how-it-works list | nothing; an `<ol>` marker takes no type class or colour | `.intake__ordinal`, a fixed-width gutter beside the step |
| List item in a `Row` | `Row`'s `as` takes `div`, `nav` or `ul` — no `li`, though `Stack` has one | the item is a `Stack as="li"` wrapping a `Row` |
| Dark closing band on the landing page | no colour utility for a brand surface, and the app is not on Tailwind | `Card variant="sunken"`, the nearest surface the system ships |

## Known limits

- **Matching is MASTER-scoped.** `findPatientsByDemographic` filters on the
  caller's org, so a patient who exists only under another org is not found —
  they get a duplicate row under MASTER via `verify/profile`, and their real
  medication history stays invisible. This is the cross-org recognition gap,
  not a bug in this flow.
- **The order stays `DRAFT`.** Graduating needs a prescription *and* a patient
  address, and intake collects no address.
- **Status is in-memory.** Refreshing `submitted` starts over.

## Known deviations from the comps

Deferred deliberately, not oversights:

- **Medication tags are not tappable.** The comp's *"Still taking these? Tap to
  remove or add others."* implies editing the medication list, which needs new
  state and a payload to carry it.
- **Date of birth is `Input type="date"`**, so the browser's own control shows
  instead of the comp's `MM / DD / YYYY` mask. The design system has no date
  picker, so matching it means a hand-built masked field.
- **The GLP-1 Yes / No answers are radio buttons**, laid out horizontally,
  not the comps' two large bordered boxes. `RadioGroup` is the system's answer
  and hand-rolling the control would mean hand-rolling its keyboard handling.
- **The medication options read as one line.** `RadioOption` is
  `{ value, label }`, so "Weekly injection · pens or vials" is concatenated
  onto the name — the same workaround the pharmacy step already uses.
- **Height is two fields**, not the comps' single `5 ft 9 in` box, which would
  need parsing rules the comps do not specify.
