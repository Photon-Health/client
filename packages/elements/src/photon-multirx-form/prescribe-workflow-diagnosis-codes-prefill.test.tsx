import { cleanup, waitFor } from '@solidjs/testing-library';
import { afterAll, afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { HttpResponse } from 'msw';
import { PatientStore } from '../stores/patient';
import { clinicalGql, defaultHandlers, lambdasGql } from '@photonhealth/sdk/test-utils';
import { MockMedicationSearchElement } from '../test-utils/mock-medication-search.element';
import { renderPrescribeWorkflow } from './test-utils/test-element-setup';
import { generatePatient } from './test-utils/generators';
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

beforeEach(() => {
  server.use(
    lambdasGql.query('patient', () => HttpResponse.json({ data: { patient: generatePatient() } })),
    lambdasGql.query('GetPatientPreferredPharmaciesAndAddress', () =>
      HttpResponse.json({
        data: { patient: generatePatient({ preferredPharmacies: [], address: null }) }
      })
    )
  );
});

afterEach(async () => {
  cleanup();
  server.resetHandlers();
  vi.clearAllMocks();
  await PatientStore.actions.reset();
});

afterAll(() => server.close());

test('emits diagnosis codes error event when JSON is malformed', async () => {
  const screenPrescriptionsQuerySpy = vi.fn();
  server.use(
    clinicalGql.query('ScreenDraftedPrescriptionsQuery', ({ variables }) => {
      screenPrescriptionsQuerySpy(variables);
      return HttpResponse.json({ data: {} });
    })
  );

  const { diagnosisCodeErrorEvents, waitForPrescribeForm, addDraftPrescription } =
    renderPrescribeWorkflow({
      enableOrder: true,
      enableSendToPatient: true,
      optionalPatientAddress: true,
      diagnosisCodes: '[not valid json'
    });

  await waitFor(() => {
    expect(diagnosisCodeErrorEvents.length).toBeGreaterThan(0);
  });

  expect(diagnosisCodeErrorEvents[0].detail).toEqual(
    expect.objectContaining({
      errors: expect.arrayContaining(['Invalid diagnosis codes json passed in'])
    })
  );

  await waitForPrescribeForm();
  await addDraftPrescription();

  // Bad JSON must not reach the API.
  expect(screenPrescriptionsQuerySpy).toHaveBeenCalled();
  expect(screenPrescriptionsQuerySpy).not.toHaveBeenCalledWith(
    expect.objectContaining({ diagnosisCodes: expect.anything() })
  );
});
