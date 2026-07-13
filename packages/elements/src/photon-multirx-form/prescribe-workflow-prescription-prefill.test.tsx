import { cleanup, screen, waitFor } from '@solidjs/testing-library';
import { afterAll, afterEach, beforeAll, expect, test, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { HttpResponse } from 'msw';
import { PatientStore } from '../stores/patient';
import { defaultHandlers, lambdasGql, TREATMENT } from '@photonhealth/sdk/test-utils';
import { MockMedicationSearchElement } from '../test-utils/mock-medication-search.element';
import { renderPrescribeWorkflow } from './test-utils/test-element-setup';
import { stubGoogleMaps } from './test-utils/stub-google-maps';

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

const SOURCE_TREATMENT = {
  __typename: 'Treatment',
  id: 'trt_source',
  name: 'Lisinopril 10mg tablet',
  codes: {}
};

const SOURCE_PRESCRIPTION = {
  __typename: 'Prescription',
  id: 'rx_source_1',
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
  instructions?: string;
  patientId?: string;
};

function mockPrescriptionPrefillHandlers(capturedPrescriptions: PrescriptionInput[]) {
  server.use(
    lambdasGql.query('GetPrescription', () =>
      HttpResponse.json({ data: { prescription: SOURCE_PRESCRIPTION } })
    ),
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
            dispenseUnit: 'Tablet',
            fillsAllowed: 2,
            daysSupply: p.daysSupply ?? 30,
            instructions: p.instructions ?? SOURCE_PRESCRIPTION.instructions,
            notes: '',
            doNotFillBeforeDate: null,
            diagnoses: [],
            treatment: SOURCE_TREATMENT
          }))
        }
      });
    })
  );
}

test('prescriptionOverrides are applied to prescriptions prefilled from prescriptionIds', async () => {
  const capturedPrescriptions: PrescriptionInput[] = [];
  mockPrescriptionPrefillHandlers(capturedPrescriptions);

  renderPrescribeWorkflow({
    prescriptionIds: 'rx_source_1',
    prescriptionOverrides: {
      rx_source_1: { externalId: 'ext_override_1', daysSupply: 90 }
    }
  });

  await waitFor(
    () => {
      expect(capturedPrescriptions).toHaveLength(1);
    },
    { timeout: 3000 }
  );

  const [sent] = capturedPrescriptions;
  // overridden fields win
  expect(sent.externalId).toBe('ext_override_1');
  expect(sent.daysSupply).toBe(90);
  // everything else still comes from the source prescription
  expect(sent.treatmentId).toBe(SOURCE_TREATMENT.id);
  expect(sent.dispenseQuantity).toBe(SOURCE_PRESCRIPTION.dispenseQuantity);
  expect(sent.instructions).toBe(SOURCE_PRESCRIPTION.instructions);
});

test('prescriptionExternalId is stamped on a prescription created from the form', async () => {
  const capturedPrescriptions: PrescriptionInput[] = [];

  server.use(
    lambdasGql.mutation('CreatePrescription', ({ variables }) => {
      capturedPrescriptions.push(variables as PrescriptionInput);
      return HttpResponse.json({
        data: {
          createPrescription: {
            __typename: 'Prescription',
            id: 'rx_form_1',
            externalId: variables.externalId ?? null,
            treatment: TREATMENT,
            dispenseQuantity: variables.dispenseQuantity,
            dispenseUnit: variables.dispenseUnit,
            fillsAllowed: variables.fillsAllowed,
            instructions: variables.instructions,
            state: 'DRAFT'
          }
        }
      });
    })
  );

  const { waitForPrescribeForm, addDraftPrescription } = renderPrescribeWorkflow({
    prescriptionExternalId: 'ext_session_1'
  });

  await waitForPrescribeForm();
  await addDraftPrescription();

  await waitFor(
    () => {
      expect(capturedPrescriptions).toHaveLength(1);
    },
    { timeout: 3000 }
  );

  expect(capturedPrescriptions[0].externalId).toBe('ext_session_1');
});

test('prescriptionExternalId is not re-used while another draft already carries it', async () => {
  const capturedPrefill: PrescriptionInput[] = [];
  const capturedFormCreates: PrescriptionInput[] = [];

  mockPrescriptionPrefillHandlers(capturedPrefill);
  server.use(
    lambdasGql.mutation('CreatePrescription', ({ variables }) => {
      capturedFormCreates.push(variables as PrescriptionInput);
      return HttpResponse.json({
        data: {
          createPrescription: {
            __typename: 'Prescription',
            id: 'rx_form_2',
            externalId: variables.externalId ?? null,
            treatment: TREATMENT,
            dispenseQuantity: variables.dispenseQuantity,
            dispenseUnit: variables.dispenseUnit,
            fillsAllowed: variables.fillsAllowed,
            instructions: variables.instructions,
            state: 'DRAFT'
          }
        }
      });
    })
  );

  const { user, waitForPrescribeForm, addDraftPrescription } = renderPrescribeWorkflow({
    prescriptionIds: 'rx_source_1',
    prescriptionOverrides: { rx_source_1: { externalId: 'ext_once' } },
    prescriptionExternalId: 'ext_once'
  });

  // wait for the prefilled draft (which carries ext_once) to land in pending order
  await screen.findByText(SOURCE_TREATMENT.name, {}, { timeout: 3000 });

  // the form is collapsed after a successful prefill — expand it to add another rx
  await user.click(await screen.findByRole('button', { name: /add another/i }));
  await waitForPrescribeForm();

  await addDraftPrescription();

  await waitFor(
    () => {
      expect(capturedFormCreates).toHaveLength(1);
    },
    { timeout: 3000 }
  );

  expect(capturedPrefill[0].externalId).toBe('ext_once');
  expect(capturedFormCreates[0].externalId).toBeUndefined();
});
