import { cleanup, waitFor } from '@solidjs/testing-library';
import { afterAll, afterEach, beforeAll, expect, test, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { HttpResponse } from 'msw';
import { PatientStore } from '../stores/patient';
import { defaultHandlers, lambdasGql } from '@photonhealth/sdk/test-utils';
import { MockMedicationSearchElement } from '../test-utils/mock-medication-search.element';
import { renderPrescribeWorkflow } from './test-utils/test-element-setup';
import { stubGoogleMaps } from '../test-utils/stub-google-maps';

vi.mock('solid-element', () => ({
  customElement: vi.fn()
}));

const server = setupServer(...defaultHandlers);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });

  window.HTMLElement.prototype.scrollIntoView = vi.fn();

  if (!customElements.get('photon-medication-search')) {
    customElements.define('photon-medication-search', MockMedicationSearchElement);
  }

  stubGoogleMaps();
});

afterEach(async () => {
  cleanup();
  server.resetHandlers();
  vi.clearAllMocks();
  await PatientStore.actions.reset();
});

afterAll(() => server.close());

// Photon treatment/medication ids are `med_…` (a prescription's `treatment.id`
// is a medication id); prescription ids are `rx_…`.
const SOURCE_MEDICATION_ID = 'med_01ARZ3NDEKTSV4RRFFQ69G5FAV';
const FRESH_MEDICATION_ID = 'med_01GQ7XZP2N8Y3W4V5T6R7S8U9M';
const SOURCE_PRESCRIPTION_ID = 'rx_01HQBE3M5V7C9K1N2P4R6T8W0X';

const SOURCE_TREATMENT = {
  __typename: 'Treatment',
  id: SOURCE_MEDICATION_ID,
  name: 'Lisinopril 10mg tablet',
  codes: {}
};

const SOURCE_PRESCRIPTION = {
  __typename: 'Prescription',
  id: SOURCE_PRESCRIPTION_ID,
  daysSupply: 30,
  dispenseAsWritten: false,
  dispenseQuantity: 30,
  dispenseUnit: 'Tablet',
  instructions: 'Take one tablet by mouth daily',
  notes: 'Source note',
  fillsAllowed: 2,
  treatment: SOURCE_TREATMENT
};

type PrescriptionInput = {
  externalId?: string;
  treatmentId?: string;
  daysSupply?: number;
  dispenseQuantity?: number;
  dispenseUnit?: string;
  fillsAllowed?: number;
  instructions?: string;
  patientId?: string;
};

// Captures the CreatePrescriptions inputs and echoes back a valid prescription
// per input. `getPrescriptionCalled` records whether the clone path ran.
function mockDraftPrefillHandlers(capturedPrescriptions: PrescriptionInput[]) {
  const state = { getPrescriptionCalled: false };

  server.use(
    lambdasGql.query('GetPrescription', () => {
      state.getPrescriptionCalled = true;
      return HttpResponse.json({ data: { prescription: SOURCE_PRESCRIPTION } });
    }),
    lambdasGql.mutation('CreatePrescriptions', ({ variables }) => {
      const prescriptions = variables.prescriptions as PrescriptionInput[];
      capturedPrescriptions.push(...prescriptions);
      return HttpResponse.json({
        data: {
          createPrescriptions: prescriptions.map((p, i) => ({
            __typename: 'Prescription',
            id: `rx_new_${i}`,
            externalId: p.externalId ?? null,
            dispenseAsWritten: false,
            dispenseQuantity: p.dispenseQuantity ?? 30,
            dispenseUnit: p.dispenseUnit ?? 'Tablet',
            fillsAllowed: p.fillsAllowed ?? 2,
            daysSupply: p.daysSupply ?? 30,
            instructions: p.instructions ?? SOURCE_PRESCRIPTION.instructions,
            notes: '',
            doNotFillBeforeDate: null,
            diagnoses: [],
            treatment: {
              __typename: 'Treatment',
              id: p.treatmentId ?? SOURCE_MEDICATION_ID,
              name: SOURCE_TREATMENT.name,
              codes: {}
            }
          }))
        }
      });
    })
  );

  return state;
}

test('draft-prescriptions rx_ entry clones the source prescription and the override wins', async () => {
  const captured: PrescriptionInput[] = [];
  const state = mockDraftPrefillHandlers(captured);

  renderPrescribeWorkflow({
    draftPrescriptions: {
      [SOURCE_PRESCRIPTION_ID]: { externalId: 'ext_override_1', daysSupply: 90 }
    }
  });

  await waitFor(
    () => {
      expect(captured).toHaveLength(1);
    },
    { timeout: 3000 }
  );

  const [sent] = captured;
  // the source prescription is fetched to clone it
  expect(state.getPrescriptionCalled).toBe(true);
  // overridden fields win
  expect(sent.externalId).toBe('ext_override_1');
  expect(sent.daysSupply).toBe(90);
  // everything else still comes from the source prescription
  expect(sent.treatmentId).toBe(SOURCE_MEDICATION_ID);
  expect(sent.dispenseQuantity).toBe(SOURCE_PRESCRIPTION.dispenseQuantity);
  expect(sent.instructions).toBe(SOURCE_PRESCRIPTION.instructions);
});

test('draft-prescriptions med_ entry creates a fresh draft with the override applied', async () => {
  const captured: PrescriptionInput[] = [];
  const state = mockDraftPrefillHandlers(captured);

  renderPrescribeWorkflow({
    draftPrescriptions: {
      [FRESH_MEDICATION_ID]: {
        externalId: 'ext_med_1',
        daysSupply: 30,
        dispenseQuantity: 30,
        dispenseUnit: 'Tablet',
        fillsAllowed: 1,
        instructions: 'Take one tablet daily'
      }
    }
  });

  await waitFor(
    () => {
      expect(captured).toHaveLength(1);
    },
    { timeout: 3000 }
  );

  const [sent] = captured;
  // no source prescription is fetched for a med_ entry
  expect(state.getPrescriptionCalled).toBe(false);
  // the fresh draft is seeded with the medication id and the override
  expect(sent.treatmentId).toBe(FRESH_MEDICATION_ID);
  expect(sent.externalId).toBe('ext_med_1');
  expect(sent.daysSupply).toBe(30);
  expect(sent.instructions).toBe('Take one tablet daily');
});

test('draft-prescriptions entries without a usable override are skipped, not created', async () => {
  const captured: PrescriptionInput[] = [];
  const state = mockDraftPrefillHandlers(captured);
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  const BLANK_MEDICATION_ID = 'med_01H0000000000000000BLANK0';
  const NO_OVERRIDE_RX_ID = 'rx_01H00000000000000000NOOP0';

  renderPrescribeWorkflow({
    draftPrescriptions: {
      // complete medication → created
      [FRESH_MEDICATION_ID]: {
        externalId: 'ext_ok',
        dispenseQuantity: 30,
        dispenseUnit: 'Tablet',
        fillsAllowed: 1,
        instructions: 'Take one tablet daily'
      },
      // medication with an empty override → skipped
      [BLANK_MEDICATION_ID]: {},
      // rx clone with an empty override → use prescription-ids instead → skipped
      [NO_OVERRIDE_RX_ID]: {}
    }
  });

  await waitFor(
    () => {
      expect(captured).toHaveLength(1);
    },
    { timeout: 3000 }
  );

  // only the complete medication reached the API
  expect(captured[0].treatmentId).toBe(FRESH_MEDICATION_ID);
  // the empty rx_ override was skipped before any source fetch
  expect(state.getPrescriptionCalled).toBe(false);
  // both unusable entries were reported
  expect(consoleError).toHaveBeenCalledWith(expect.stringContaining(BLANK_MEDICATION_ID));
  expect(consoleError).toHaveBeenCalledWith(expect.stringContaining(NO_OVERRIDE_RX_ID));

  consoleError.mockRestore();
});
