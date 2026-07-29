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
import { PrescriptionOverrides } from '@photonhealth/components';

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

test('additonalNotes are merged into draft prescriptions from an existing prescriptionId', async () => {
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
    prescriptionIds: PRESCRIPTION.id,
    additionalNotes: 'Clinical additional note from host app'
  });

  await waitForDraftPrescription();

  expect(capturedPrescriptionQueryVariables?.id).toBe(PRESCRIPTION.id);

  const [sent] = capturedPrescriptions;
  expect(sent.notes).toBe(
    [PRESCRIPTION.notes, 'Clinical additional note from host app'].join('\n\n')
  );
});

test('prefill a draft prescription from an existing prescriptionId with overrides', async () => {
  const capturedPrescriptions: PrescriptionInput[] = [];
  let capturedPrescriptionQueryVariables: { id: string } | undefined;

  const overrides: PrescriptionOverrides['rx_123'] = {
    externalId: 'ext_456',
    treatmentId: 'trt_override',
    dispenseQuantity: 60,
    dispenseUnit: 'Tablets',
    dispenseAsWritten: true,
    fillsAllowed: 5,
    daysSupply: 60,
    instructions: 'Take two tablets by mouth twice daily',
    notes: 'Override note for prescription'
  };

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
    prescriptionIds: PRESCRIPTION.id,
    prescriptionOverrides: { [PRESCRIPTION.id]: overrides }
  });

  await waitForDraftPrescription();

  expect(capturedPrescriptionQueryVariables?.id).toBe(PRESCRIPTION.id);

  const [sent] = capturedPrescriptions;
  expect(sent.treatmentId).toBe(overrides.treatmentId);
  expect(sent.externalId).toBe(overrides.externalId);
  expect(sent.dispenseQuantity).toBe(overrides.dispenseQuantity);
  expect(sent.dispenseUnit).toBe(overrides.dispenseUnit);
  expect(sent.dispenseAsWritten).toBe(overrides.dispenseAsWritten);
  expect(sent.fillsAllowed).toBe(overrides.fillsAllowed);
  expect(sent.daysSupply).toBe(overrides.daysSupply);
  expect(sent.instructions).toBe(overrides.instructions);
  expect(sent.notes).toBe(overrides.notes);
});

test('additonalNotes are merged into draft prescriptions from an existing prescriptionId with overrides', async () => {
  const capturedPrescriptions: PrescriptionInput[] = [];
  let capturedPrescriptionQueryVariables: { id: string } | undefined;

  const overrides: PrescriptionOverrides['rx_123'] = {
    notes: 'Override note for prescription'
  };

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
    prescriptionIds: PRESCRIPTION.id,
    prescriptionOverrides: { [PRESCRIPTION.id]: overrides },
    additionalNotes: 'Clinical additional note from host app'
  });

  await waitForDraftPrescription();

  expect(capturedPrescriptionQueryVariables?.id).toBe(PRESCRIPTION.id);

  const [sent] = capturedPrescriptions;
  expect(sent.notes).toBe([overrides.notes, 'Clinical additional note from host app'].join('\n\n'));
});

test('if prescriptionId cannot be found, render the prescription form', async () => {
  let capturedPrescriptionQueryVariables: { id: string } | undefined;

  server.use(
    lambdasGql.query('GetPrescription', ({ variables }) => {
      capturedPrescriptionQueryVariables = variables as { id: string };
      return HttpResponse.json({
        data: {
          prescription: null
        },
        errors: [
          {
            path: ['prescription'],
            locations: [
              {
                line: 2,
                column: 3
              }
            ],
            message: 'No prescription found with id tmp_01HHDP9WH6BGC2YBATFQQP79YT'
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

  expect(capturedPrescriptionQueryVariables?.id).toBe(PRESCRIPTION.id);
});
