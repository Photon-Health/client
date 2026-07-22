import { cleanup, screen, waitFor } from '@solidjs/testing-library';
import { afterAll, afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { HttpResponse } from 'msw';
import { GraphQLError } from 'graphql';
import { PatientStore } from '../stores/patient';
import { clinicalGql, defaultHandlers, lambdasGql, TREATMENT } from '@photonhealth/sdk/test-utils';
import { MockMedicationSearchElement } from '../test-utils/mock-medication-search.element';
import { renderPrescribeWorkflow } from './test-utils/test-element-setup';
import { generateAddress, generatePatient, generatePharmacy } from './test-utils/generators';
import { makeGeocodeResult, stubGoogleMaps } from '../test-utils/stub-google-maps';

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

test('does not fire GenerateCoverageOptions when enableCoverageCheck is false', async () => {
  const generateCoverageSpy = vi.fn();
  server.use(
    clinicalGql.mutation('GenerateCoverageOptions', ({ variables }) => {
      generateCoverageSpy(variables);
      return HttpResponse.json({ data: { generateCoverageOptions: [] } });
    })
  );

  const { waitForPrescribeForm, addDraftPrescription, waitForDraftPrescription } =
    renderPrescribeWorkflow({
      enableCoverageCheck: false
    });

  await waitForPrescribeForm();
  await addDraftPrescription();
  await waitForDraftPrescription();

  // Give any in-flight effects a chance to settle...
  await new Promise((r) => setTimeout(r, 50));

  expect(generateCoverageSpy).not.toHaveBeenCalled();
});

test("uses the patient's preferred pharmacy when one is set", async () => {
  server.use(
    lambdasGql.query('GetPatientPreferredPharmaciesAndAddress', () =>
      HttpResponse.json({
        data: {
          patient: generatePatient({
            preferredPharmacies: [
              generatePharmacy({ id: 'phr_preferred', name: 'Preferred Pharmacy' })
            ],
            address: null
          })
        }
      })
    )
  );

  const generateCoverageSpy = vi.fn();
  server.use(
    clinicalGql.mutation('GenerateCoverageOptions', ({ variables }) => {
      generateCoverageSpy(variables);
      return HttpResponse.json({ data: { generateCoverageOptions: [] } });
    })
  );

  const { waitForPrescribeForm, addDraftPrescription } = renderPrescribeWorkflow({
    enableCoverageCheck: true
  });

  await waitForPrescribeForm();
  await addDraftPrescription();

  await waitFor(
    () => {
      expect(generateCoverageSpy).toHaveBeenCalledWith(
        expect.objectContaining({ pharmacyId: 'phr_preferred' })
      );
    },
    { timeout: 3000 }
  );
});

test('falls back to a nearby pharmacy when no preferred pharmacy', async () => {
  stubGoogleMaps([makeGeocodeResult(40.7128, -74.006, '1 Main, NY, NY 10001')]);

  server.use(
    lambdasGql.query('GetPatientPreferredPharmaciesAndAddress', () =>
      HttpResponse.json({
        data: {
          patient: generatePatient({
            preferredPharmacies: [],
            address: generateAddress({
              id: 'addr_1',
              street1: '1 Main',
              city: 'NY',
              state: 'NY',
              postalCode: '10001',
              country: 'US'
            })
          })
        }
      })
    ),
    lambdasGql.query('GetPharmacies', () =>
      HttpResponse.json({
        data: {
          pharmacies: [generatePharmacy({ id: 'phr_walgreens', name: 'Walgreens #123' })]
        }
      })
    )
  );

  const generateCoverageSpy = vi.fn();
  server.use(
    clinicalGql.mutation('GenerateCoverageOptions', ({ variables }) => {
      generateCoverageSpy(variables);
      return HttpResponse.json({ data: { generateCoverageOptions: [] } });
    })
  );

  const { waitForPrescribeForm, addDraftPrescription } = renderPrescribeWorkflow({
    enableCoverageCheck: true
  });

  await waitForPrescribeForm();
  await addDraftPrescription();

  await waitFor(
    () => {
      expect(generateCoverageSpy).toHaveBeenCalledWith(
        expect.objectContaining({ pharmacyId: 'phr_walgreens' })
      );
    },
    { timeout: 3000 }
  );
});

test('silently ignores errors from GenerateCoverageOptions (current behavior)', async () => {
  // TODO: show error instead of ignore in KLU-275
  const unhandledRejections: unknown[] = [];
  const rejectionHandler = (reason: unknown) => unhandledRejections.push(reason);
  process.on('unhandledRejection', rejectionHandler);

  server.use(
    lambdasGql.query('GetPatientPreferredPharmaciesAndAddress', () =>
      HttpResponse.json({
        data: {
          patient: generatePatient({
            preferredPharmacies: [
              generatePharmacy({ id: 'phr_preferred', name: 'Preferred Pharmacy' })
            ],
            address: null
          })
        }
      })
    )
  );

  const generateCoverageSpy = vi.fn();
  server.use(
    clinicalGql.mutation('GenerateCoverageOptions', () => {
      generateCoverageSpy();
      return HttpResponse.json({ errors: [new GraphQLError('Coverage service down')] });
    })
  );

  const { waitForPrescribeForm, addDraftPrescription } = renderPrescribeWorkflow({
    enableCoverageCheck: true
  });

  await waitForPrescribeForm();
  await addDraftPrescription();

  await waitFor(() => expect(generateCoverageSpy).toHaveBeenCalled(), { timeout: 3000 });

  await screen.findByText(TREATMENT.name);

  // No user-facing error UI today
  expect(screen.queryByText(/coverage/i)).toBeNull();
  expect(screen.queryByRole('alert')).toBeNull();

  // Confirm an unhandled rejection occurred
  // and prevent it from failing the test run.
  await waitFor(() => expect(unhandledRejections.length).toBeGreaterThan(0));
  process.off('unhandledRejection', rejectionHandler);
});
