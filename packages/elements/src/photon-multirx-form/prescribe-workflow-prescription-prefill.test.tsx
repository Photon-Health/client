import { cleanup } from '@solidjs/testing-library';
import { afterAll, afterEach, beforeAll, expect, test, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { HttpResponse } from 'msw';
import { PatientStore } from '../stores/patient';
import { defaultHandlers, lambdasGql, PRESCRIPTION } from '@photonhealth/sdk/test-utils';
import { MockMedicationSearchElement } from '../test-utils/mock-medication-search.element';
import { renderPrescribeWorkflow } from './test-utils/test-element-setup';
import { stubGoogleMaps } from '../test-utils/stub-google-maps';
import { PrescriptionInput } from '@photonhealth/sdk/dist/types';

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

test('prefill a draft prescription from an existing prescriptionId', async () => {
  const capturedPrescriptions: PrescriptionInput[] = [];
  let capturedPrescriptionQueryVariables: { id: string } | undefined;

  server.use(
    lambdasGql.query('GetPrescription', ({ variables }) => {
      capturedPrescriptionQueryVariables = variables as { id: string };
      return HttpResponse.json({
        data: {
          prescription: PRESCRIPTION
        }
      });
    }),
    lambdasGql.mutation('CreatePrescriptions', ({ variables }) => {
      const prescriptions = variables.prescriptions as PrescriptionInput[];
      capturedPrescriptions.push(...prescriptions);
      return HttpResponse.json({
        data: {
          createPrescriptions: prescriptions.map((p, i) => ({
            ...PRESCRIPTION,
            id: `rx_${i}`
          }))
        }
      });
    })
  );

  const { waitForDraftPrescription } = renderPrescribeWorkflow({
    prescriptionIds: PRESCRIPTION.id
  });

  await waitForDraftPrescription();

  expect(capturedPrescriptionQueryVariables?.id).toBe(PRESCRIPTION.id);

  const [sent] = capturedPrescriptions;
  expect(sent.treatmentId).toBe(PRESCRIPTION.treatment.id);
  expect(sent.daysSupply).toBe(PRESCRIPTION.daysSupply);
  expect(sent.dispenseAsWritten).toBe(PRESCRIPTION.dispenseAsWritten);
  expect(sent.dispenseQuantity).toBe(PRESCRIPTION.dispenseQuantity);
  expect(sent.dispenseUnit).toBe(PRESCRIPTION.dispenseUnit);
  expect(sent.instructions).toBe(PRESCRIPTION.instructions);
  expect(sent.notes).toBe(PRESCRIPTION.notes);
  expect(sent.fillsAllowed).toBe(PRESCRIPTION.fillsAllowed);
});

test('if prefilling from prescriptionIds fails, render the prescription form', async () => {
  const capturedPrescriptions: PrescriptionInput[] = [];

  server.use(
    lambdasGql.query('GetPrescription', () => {
      return HttpResponse.json({
        data: {
          prescription: PRESCRIPTION
        }
      });
    }),
    lambdasGql.mutation('CreatePrescriptions', ({ variables }) => {
      const prescriptions = variables.prescriptions as PrescriptionInput[];
      capturedPrescriptions.push(...prescriptions);
      return HttpResponse.json({
        data: null,
        errors: [
          {
            path: ['createPrescriptions'],
            locations: [
              {
                line: 2,
                column: 3
              }
            ],
            message: 'sdfsdfsdfs is not a valid dispense unit'
          }
        ]
      });
    })
  );

  const { waitForPrescribeForm } = renderPrescribeWorkflow({
    prescriptionIds: PRESCRIPTION.id
  });

  // Since creating the draft prescription failed,
  // the prescribe workflow should render with the form expanded
  await waitForPrescribeForm();

  // Check that the prefill values made it to the mutation
  const [sent] = capturedPrescriptions;
  expect(sent.treatmentId).toBe(PRESCRIPTION.treatment.id);
});
