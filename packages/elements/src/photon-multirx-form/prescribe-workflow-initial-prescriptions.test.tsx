import { cleanup, screen, waitFor } from '@solidjs/testing-library';
import { afterAll, afterEach, beforeAll, expect, test, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { HttpResponse } from 'msw';
import { addYears, format } from 'date-fns';
import { PatientStore } from '../stores/patient';
import { defaultHandlers, lambdasGql, PRESCRIPTION, TREATMENT } from '@photonhealth/sdk/test-utils';
import { MockMedicationSearchElement } from '../test-utils/mock-medication-search.element';
import { renderPrescribeWorkflow } from './test-utils/test-element-setup';
import { stubGoogleMaps } from '../test-utils/stub-google-maps';
import { PrescriptionInput } from '@photonhealth/sdk/dist/types';
import { CALENDAR_DATE_FORMAT, InitialPrescriptionsPrefill } from '@photonhealth/components';

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

test('prefill a draft prescription from initialPrescriptions', async () => {
  const capturedPrescriptionInputs: PrescriptionInput[] = [];

  const doNotFillBeforeDate = format(addYears(new Date(), 1), CALENDAR_DATE_FORMAT);

  const initialPrescription = {
    externalId: 'ext_initial_1',
    treatmentId: TREATMENT.id,
    dispenseQuantity: 60,
    dispenseUnit: 'Tablets',
    dispenseAsWritten: true,
    fillsAllowed: 3,
    daysSupply: 30,
    instructions: 'Take two tablets by mouth twice daily',
    notes: 'Note for the initial prescription',
    doNotFillBeforeDate
  };

  server.use(
    lambdasGql.mutation('CreatePrescriptions', ({ variables }) => {
      const prescriptions = variables.prescriptions as PrescriptionInput[];
      capturedPrescriptionInputs.push(...prescriptions);
      return HttpResponse.json({
        data: {
          createPrescriptions: prescriptions.map((p, i) => ({
            ...PRESCRIPTION,
            id: `rx_initial_${i}`
          }))
        }
      });
    })
  );

  const { waitForDraftPrescription } = renderPrescribeWorkflow({
    initialPrescriptions: [initialPrescription]
  });

  await waitForDraftPrescription();

  expect(capturedPrescriptionInputs).toHaveLength(1);

  const [sent] = capturedPrescriptionInputs;
  expect(sent.patientId).toBe('pat_123');
  expect(sent.externalId).toBe(initialPrescription.externalId);
  expect(sent.treatmentId).toBe(initialPrescription.treatmentId);
  expect(sent.dispenseQuantity).toBe(initialPrescription.dispenseQuantity);
  expect(sent.dispenseUnit).toBe(initialPrescription.dispenseUnit);
  expect(sent.dispenseAsWritten).toBe(initialPrescription.dispenseAsWritten);
  expect(sent.fillsAllowed).toBe(initialPrescription.fillsAllowed);
  expect(sent.daysSupply).toBe(initialPrescription.daysSupply);
  expect(sent.instructions).toBe(initialPrescription.instructions);
  expect(sent.notes).toBe(initialPrescription.notes);
  expect(sent.doNotFillBeforeDate).toBe(doNotFillBeforeDate);
});

test('prefill multiple draft prescriptions from initialPrescriptions', async () => {
  const capturedPrescriptionInputs: PrescriptionInput[] = [];

  server.use(
    lambdasGql.mutation('CreatePrescriptions', ({ variables }) => {
      const prescriptions = variables.prescriptions as PrescriptionInput[];
      capturedPrescriptionInputs.push(...prescriptions);
      return HttpResponse.json({
        data: {
          createPrescriptions: prescriptions.map((p, i) => ({
            ...PRESCRIPTION,
            id: `rx_initial_${i}`
          }))
        }
      });
    })
  );

  renderPrescribeWorkflow({
    initialPrescriptions: [
      {
        treatmentId: TREATMENT.id,
        dispenseQuantity: 30,
        dispenseUnit: 'Tablet',
        fillsAllowed: 1,
        daysSupply: 30,
        instructions: 'Take one tablet by mouth daily'
      },
      {
        treatmentId: 'trt_456',
        dispenseQuantity: 90,
        dispenseUnit: 'Capsule',
        fillsAllowed: 2,
        daysSupply: 90,
        instructions: 'Take one capsule by mouth daily'
      }
    ]
  });

  // Both drafts come back from the mocked mutation with the same treatment.
  // Normally having two drafts with the same treatment isn't allowed
  // but this is fine for testing purposes.
  await waitFor(() => expect(screen.getAllByText(TREATMENT.name)).toHaveLength(2), {
    timeout: 3000
  });

  expect(capturedPrescriptionInputs).toHaveLength(2);
  expect(capturedPrescriptionInputs.map((rx) => rx.treatmentId)).toEqual([TREATMENT.id, 'trt_456']);
});

test('initialPrescriptions with invalid field values are not sent to the mutation', async () => {
  const capturedPrescriptionInputs: PrescriptionInput[] = [];

  server.use(
    lambdasGql.mutation('CreatePrescriptions', ({ variables }) => {
      capturedPrescriptionInputs.push(...(variables.prescriptions as PrescriptionInput[]));
      return HttpResponse.json({
        data: { createPrescriptions: [PRESCRIPTION] }
      });
    })
  );

  const { waitForPrescribeForm } = renderPrescribeWorkflow({
    initialPrescriptions: [
      {
        // Missing the required treatmentId, non-positive dispenseQuantity,
        // and fillsAllowed above the allowed maximum
        dispenseQuantity: 0,
        dispenseUnit: 'Tablet',
        fillsAllowed: 99,
        daysSupply: 30,
        instructions: 'Take one tablet by mouth daily'
      }
    ]
  });

  // Validation fails before the mutation, so the workflow renders with the form expanded
  await waitForPrescribeForm();
  expect(capturedPrescriptionInputs).toHaveLength(0);
});

test('a doNotFillBeforeDate in the past is not sent to the mutation', async () => {
  const capturedPrescriptionInputs: PrescriptionInput[] = [];

  server.use(
    lambdasGql.mutation('CreatePrescriptions', ({ variables }) => {
      capturedPrescriptionInputs.push(...(variables.prescriptions as PrescriptionInput[]));
      return HttpResponse.json({
        data: { createPrescriptions: [PRESCRIPTION] }
      });
    })
  );

  const { waitForPrescribeForm } = renderPrescribeWorkflow({
    initialPrescriptions: [
      {
        treatmentId: TREATMENT.id,
        dispenseQuantity: 30,
        dispenseUnit: 'Tablet',
        fillsAllowed: 1,
        daysSupply: 30,
        instructions: 'Take one tablet by mouth daily',
        doNotFillBeforeDate: format(addYears(new Date(), -1), CALENDAR_DATE_FORMAT)
      }
    ]
  });

  await waitForPrescribeForm();
  expect(capturedPrescriptionInputs).toHaveLength(0);
});

test('initialPrescriptions that failed to parse as JSON are not sent to the mutation', async () => {
  const capturedPrescriptionInputs: PrescriptionInput[] = [];

  server.use(
    lambdasGql.mutation('CreatePrescriptions', ({ variables }) => {
      capturedPrescriptionInputs.push(...(variables.prescriptions as PrescriptionInput[]));
      return HttpResponse.json({
        data: { createPrescriptions: [PRESCRIPTION] }
      });
    })
  );

  const { waitForPrescribeForm } = renderPrescribeWorkflow({
    // solid-element hands the raw string through when the attribute isn't valid JSON
    initialPrescriptions: '[{ treatmentId: trt_123 }]' as InitialPrescriptionsPrefill
  });

  await waitForPrescribeForm();
  expect(capturedPrescriptionInputs).toHaveLength(0);
});

test('if creating prescriptions from initialPrescriptions fails, render the prescription form', async () => {
  const capturedPrescriptionInputs: PrescriptionInput[] = [];

  server.use(
    lambdasGql.mutation('CreatePrescriptions', ({ variables }) => {
      capturedPrescriptionInputs.push(...(variables.prescriptions as PrescriptionInput[]));
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
            message: 'No treatment found with id trt_does_not_exist'
          }
        ]
      });
    })
  );

  const { waitForPrescribeForm } = renderPrescribeWorkflow({
    initialPrescriptions: [
      {
        treatmentId: 'trt_does_not_exist',
        dispenseQuantity: 30,
        dispenseUnit: 'Tablet',
        fillsAllowed: 1,
        daysSupply: 30,
        instructions: 'Take one tablet by mouth daily'
      }
    ]
  });

  // Since creating the draft prescription failed,
  // the prescribe workflow should render with the form expanded
  await waitForPrescribeForm();

  // The prefill values still made it to the mutation
  const [sent] = capturedPrescriptionInputs;
  expect(sent.treatmentId).toBe('trt_does_not_exist');
});
