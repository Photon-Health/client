import { cleanup, render, screen, waitFor } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { GoogleServiceProvider, PhotonContext, SDKProvider } from '@photonhealth/components';
import { afterAll, afterEach, beforeAll, expect, test, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { HttpResponse } from 'msw';
import { GraphQLError } from 'graphql';
import { PatientStore } from '../stores/patient';
import {
  PhotonPrescribeWorkflowComponent,
  type PrescribeWorkflowComponentProps
} from './photon-prescribe-workflow-component';
import { createTestClient, createTestClientStore } from '../test-utils/createTestClient';
import {
  clinicalGql,
  defaultHandlers,
  DISPENSE_UNIT,
  lambdasGql,
  TREATMENT
} from '@photonhealth/sdk/test-utils';
import { MockMedicationSearchElement } from '../test-utils/mock-medication-search.element';

vi.mock('solid-element', () => ({
  customElement: vi.fn()
}));

// Apollo's InMemoryCache writes every field present in a response into the
// cache, regardless of the query's selection set. The shared `PATIENT` fixture
// over-returns fields (e.g. `preferredPharmacies`, `address`) that the SDK's
// `patient` query doesn't actually select — so cached values from that initial
// call satisfy the downstream `GetPatientPreferredPharmaciesAndAddress` query
// via cache-first, and per-test overrides of that query never reach the
// network. To keep the cache honest, we override the default `patient` handler
// here with a fixture that contains ONLY the fields PATIENT_FIELDS selects.
const PATIENT_SDK_FIXTURE = {
  __typename: 'Patient',
  id: 'pat_123',
  externalId: 'ext_pat_123',
  name: { __typename: 'Name', full: 'Sally Patient' },
  dateOfBirth: '1990-01-01',
  sex: 'FEMALE',
  gender: 'female',
  email: 'sally@example.com',
  phone: '+17185551234',
  address: null
};

// Default response for GetPatientPreferredPharmaciesAndAddress — no preferred
// pharmacies, no address. Per-test overrides replace this when they need a
// preferred pharmacy or a local-pharmacy-with-address scenario.
const EMPTY_PREFERRED_PHARMACIES_FIXTURE = {
  __typename: 'Patient',
  id: 'pat_123',
  preferredPharmacies: [],
  address: null
};

const server = setupServer(...defaultHandlers);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });

  window.HTMLElement.prototype.scrollIntoView = vi.fn();

  if (!customElements.get('photon-medication-search')) {
    customElements.define('photon-medication-search', MockMedicationSearchElement);
  }

  // Default Geocoder stub. The local-pharmacy test overrides `geocode` to
  // return real coordinates so fetchLocalPharmacies proceeds.
  Object.defineProperty(window, 'google', {
    configurable: true,
    writable: true,
    value: {
      maps: {
        Geocoder: class Geocoder {
          geocode = vi.fn(async () => ({ results: [] }));
        },
        places: { AutocompleteService: class AutocompleteService {} }
      }
    }
  });
});

beforeEach(() => {
  // Re-register file-level overrides after server.resetHandlers() in afterEach.
  server.use(
    lambdasGql.query('patient', () =>
      HttpResponse.json({ data: { patient: PATIENT_SDK_FIXTURE } })
    ),
    lambdasGql.query('GetPatientPreferredPharmaciesAndAddress', () =>
      HttpResponse.json({ data: { patient: EMPTY_PREFERRED_PHARMACIES_FIXTURE } })
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

  const { user } = renderPrescribeWorkflow({ enableCoverageCheck: false });

  await waitForPrescribeForm();
  await addDraftPrescription(user);
  await screen.findByText(TREATMENT.name, {}, { timeout: 3000 });

  // Give any in-flight effects a chance to settle; assertion stays negative.
  await new Promise((r) => setTimeout(r, 50));
  expect(generateCoverageSpy).not.toHaveBeenCalled();
});

test("uses the patient's preferred pharmacy when one is set", async () => {
  server.use(
    lambdasGql.query('GetPatientPreferredPharmaciesAndAddress', () =>
      HttpResponse.json({
        data: {
          patient: {
            __typename: 'Patient',
            id: 'pat_123',
            preferredPharmacies: [
              {
                __typename: 'Pharmacy',
                id: 'phr_preferred',
                name: 'Preferred Pharmacy',
                address: {
                  __typename: 'Address',
                  street1: '1 Main',
                  city: 'NY',
                  state: 'NY'
                }
              }
            ],
            address: null
          }
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

  const { user } = renderPrescribeWorkflow({ enableCoverageCheck: true });

  await waitForPrescribeForm();
  await addDraftPrescription(user);

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
  // Make the geocoder return a real lat/lng so fetchLocalPharmacies proceeds.
  Object.defineProperty(window, 'google', {
    configurable: true,
    writable: true,
    value: {
      maps: {
        Geocoder: class Geocoder {
          geocode = vi.fn(async () => ({
            results: [
              {
                geometry: { location: { lat: () => 40.7128, lng: () => -74.006 } },
                formatted_address: '1 Main, NY, NY 10001'
              }
            ]
          }));
        },
        places: { AutocompleteService: class AutocompleteService {} }
      }
    }
  });

  server.use(
    lambdasGql.query('GetPatientPreferredPharmaciesAndAddress', () =>
      HttpResponse.json({
        data: {
          patient: {
            __typename: 'Patient',
            id: 'pat_123',
            preferredPharmacies: [],
            address: {
              __typename: 'Address',
              id: 'addr_1',
              name: null,
              street1: '1 Main',
              street2: null,
              city: 'NY',
              state: 'NY',
              postalCode: '10001',
              country: 'US'
            }
          }
        }
      })
    ),
    lambdasGql.query('GetPharmacies', () =>
      HttpResponse.json({
        data: {
          pharmacies: [
            {
              __typename: 'Pharmacy',
              id: 'phr_walgreens',
              name: 'Walgreens #123',
              address: { street1: '99 Main', city: 'NY', state: 'NY' }
            }
          ]
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

  const { user } = renderPrescribeWorkflow({ enableCoverageCheck: true });

  await waitForPrescribeForm();
  await addDraftPrescription(user);

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
  // TODO: This test backfills today's silent-failure behavior. The follow-up PR
  // that adds the error Banner will flip the assertions here.
  //
  // PrescribeProvider awaits the mutation without a .catch, so a rejection
  // surfaces as an unhandled Promise rejection. Capture it here so vitest
  // doesn't fail the run on what is today's intended behavior.
  const unhandledRejections: unknown[] = [];
  const rejectionHandler = (reason: unknown) => unhandledRejections.push(reason);
  process.on('unhandledRejection', rejectionHandler);

  server.use(
    lambdasGql.query('GetPatientPreferredPharmaciesAndAddress', () =>
      HttpResponse.json({
        data: {
          patient: {
            __typename: 'Patient',
            id: 'pat_123',
            preferredPharmacies: [
              {
                __typename: 'Pharmacy',
                id: 'phr_preferred',
                name: 'Preferred Pharmacy',
                address: {
                  __typename: 'Address',
                  street1: '1 Main',
                  city: 'NY',
                  state: 'NY'
                }
              }
            ],
            address: null
          }
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

  const { user } = renderPrescribeWorkflow({ enableCoverageCheck: true });

  await waitForPrescribeForm();
  await addDraftPrescription(user);

  // The mutation was invoked
  await waitFor(() => expect(generateCoverageSpy).toHaveBeenCalled(), { timeout: 3000 });

  // The draft still renders
  await screen.findByText(TREATMENT.name);

  // No user-facing error UI today
  expect(screen.queryByText(/coverage/i)).toBeNull();
  expect(screen.queryByRole('alert')).toBeNull();

  // Confirm an unhandled rejection occurred (current bug we'll fix in a follow-up)
  // and prevent it from failing the test run.
  await waitFor(() => expect(unhandledRejections.length).toBeGreaterThan(0));
  process.off('unhandledRejection', rejectionHandler);
});

function renderPrescribeWorkflow(props: Partial<PrescribeWorkflowComponentProps> = {}) {
  const client = createTestClient();
  const clientStore = createTestClientStore(client);
  const eventListenerHost = document.createElement('div');
  document.body.append(eventListenerHost);

  const baseProps: PrescribeWorkflowComponentProps = {
    patientId: 'pat_123',
    hideSubmit: false,
    hideTemplates: false,
    hidePatientCard: false,
    enableOrder: false,
    enableMedHistory: false,
    enableMedHistoryLinks: false,
    enableMedHistoryRefillButton: false,
    enableCombineAndDuplicate: false,
    optionalPatientAddress: false,
    triggerSubmit: false,
    toastBuffer: 0,
    enableCoverageCheck: false,
    enableLocalPickup: false,
    enableSendToPatient: false,
    enableDeliveryPharmacies: false
  };

  const mergedProps = { ...baseProps, ...props };

  const view = render(
    () => (
      <PhotonContext.Provider value={clientStore as never}>
        <SDKProvider client={client as never}>
          <GoogleServiceProvider>
            <PhotonPrescribeWorkflowComponent {...mergedProps} />
          </GoogleServiceProvider>
        </SDKProvider>
      </PhotonContext.Provider>
    ),
    { container: eventListenerHost }
  );

  return { ...view, user: userEvent.setup() };
}

async function waitForPrescribeForm() {
  await screen.findByRole('button', { name: /add prescription/i }, { timeout: 3000 });
}

async function addDraftPrescription(user: ReturnType<typeof userEvent.setup>) {
  await user.selectOptions(screen.getByLabelText(/search for treatment/i), TREATMENT.id);
  await user.type(screen.getByLabelText(/quantity/i), '30');
  await user.selectOptions(screen.getByLabelText(/dispense unit/i), DISPENSE_UNIT.name);
  await user.type(screen.getByLabelText(/days supply/i), '10');
  await user.type(screen.getByLabelText(/^refills/i), '0');
  await user.type(
    screen.getByLabelText(/patient instructions/i),
    'Take one capsule by mouth daily'
  );
  await user.click(screen.getByRole('button', { name: /add prescription/i }));
}
