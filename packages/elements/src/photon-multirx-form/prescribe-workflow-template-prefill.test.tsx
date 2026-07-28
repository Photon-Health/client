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
import { TemplateOverrides } from '@photonhealth/components';

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

test('prefill a draft prescription from templateIds with overrides', async () => {
  const capturedPrescriptionInputs: PrescriptionInput[] = [];

  const overrides: TemplateOverrides['tpl_1'] = {
    externalId: 'ext_123',
    dispenseQuantity: 60,
    dispenseUnit: 'Tablets',
    dispenseAsWritten: true,
    fillsAllowed: 3,
    daysSupply: 30,
    instructions: 'Take two tablets by mouth twice daily',
    notes: 'Override note for tpl_1'
  };

  server.use(
    lambdasGql.mutation('CreatePrescriptions', ({ variables }) => {
      const prescriptions = variables.prescriptions as PrescriptionInput[];
      capturedPrescriptionInputs.push(...prescriptions);
      return HttpResponse.json({
        data: {
          createPrescriptions: prescriptions.map((p, i) => ({
            ...PRESCRIPTION,
            id: `rx_tpl_${i}`
          }))
        }
      });
    })
  );

  const { waitForDraftPrescription } = renderPrescribeWorkflow({
    templateIds: 'tpl_1',
    templateOverrides: { tpl_1: overrides }
  });

  await waitForDraftPrescription();

  const [sent] = capturedPrescriptionInputs;
  expect(sent.templateId).toBe('tpl_1');
  expect(sent.externalId).toBe(overrides.externalId);
  expect(sent.dispenseQuantity).toBe(overrides.dispenseQuantity);
  expect(sent.dispenseUnit).toBe(overrides.dispenseUnit);
  expect(sent.dispenseAsWritten).toBe(overrides.dispenseAsWritten);
  expect(sent.fillsAllowed).toBe(overrides.fillsAllowed);
  expect(sent.daysSupply).toBe(overrides.daysSupply);
  expect(sent.instructions).toBe(overrides.instructions);
  expect(sent.notes).toBe(overrides.notes);
});

test('additionalNotes are merged into prescriptions prefilled from templateIds', async () => {
  const capturedPrescriptionInputs: PrescriptionInput[] = [];

  server.use(
    lambdasGql.mutation('CreatePrescriptions', ({ variables }) => {
      const prescriptions = variables.prescriptions as PrescriptionInput[];
      capturedPrescriptionInputs.push(...prescriptions);
      return HttpResponse.json({
        data: {
          createPrescriptions: prescriptions.map((p, i) => ({
            ...PRESCRIPTION,
            id: `rx_tpl_${i}`
          }))
        }
      });
    })
  );

  const { waitForDraftPrescription } = renderPrescribeWorkflow({
    templateIds: 'tpl_1',
    templateOverrides: { tpl_1: { notes: 'Template override note' } },
    additionalNotes: 'Clinical additional note from host app'
  });

  await waitForDraftPrescription();

  const [sent] = capturedPrescriptionInputs;
  expect(sent.templateId).toBe('tpl_1');
  // Bug: additionalNotes never reach the CreatePrescriptions mutation for
  // template-prefilled rxs — only templateOverrides notes make it through.
  expect(sent.notes).toContain('Clinical additional note from host app');
});

test('if prefilling from templateIds fails, render the prescription form', async () => {
  const capturedPrescriptionInputs: PrescriptionInput[] = [];

  server.use(
    lambdasGql.mutation('CreatePrescriptions', ({ variables }) => {
      const prescriptions = variables.prescriptions as PrescriptionInput[];
      capturedPrescriptionInputs.push(...prescriptions);
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
    templateIds: 'tpl_1',
    // Invalid dispense unit
    templateOverrides: { tpl_1: { dispenseUnit: 'asdfsdfsf' } }
  });

  // Since creating the draft prescription failed,
  // the prescribe workflow should render with the form expanded
  await waitForPrescribeForm();

  // Check that the prefill values made it to the mutation
  const [sent] = capturedPrescriptionInputs;
  expect(sent.templateId).toBe('tpl_1');
  expect(sent.dispenseUnit).toBe('asdfsdfsf');
});
