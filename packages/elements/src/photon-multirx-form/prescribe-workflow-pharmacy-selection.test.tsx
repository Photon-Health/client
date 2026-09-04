import { cleanup, screen, waitFor } from '@solidjs/testing-library';
import { afterAll, afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { HttpResponse } from 'msw';
import { PatientStore } from '../stores/patient';
import { clinicalGql, defaultHandlers, lambdasGql } from '@photonhealth/sdk/test-utils';
import { MockMedicationSearchElement } from '../test-utils/mock-medication-search.element';
import { renderPrescribeWorkflow } from './test-utils/test-element-setup';
import { generateAddress, generatePatient, generatePharmacy } from './test-utils/generators';
import { makeGeocodeResult, stubGoogleMaps } from '../test-utils/stub-google-maps';

vi.mock('solid-element', () => ({
  customElement: vi.fn()
}));

const LILLY_DIRECT_ID = 'phr_01J6APWHGNFJCE74SB031VYPHW';
const LILLY_DIRECT_NAME = 'LillyDirect Self Pay Pharmacy Solutions';

const ZEPBOUND_VIAL_TREATMENT = {
  __typename: 'Treatment',
  id: 'trt_123',
  name: 'Zepbound 2.5mg/0.5mL vial',
  codes: {
    __typename: 'TreatmentCodes',
    packageNDC: '00002-0152-04',
    productNDC: '00002-0152'
  }
};

const UNCONSTRAINED_TREATMENT = {
  __typename: 'Treatment',
  id: 'trt_123',
  name: 'Amoxicillin 500mg capsule',
  codes: {
    __typename: 'TreatmentCodes',
    packageNDC: '00093-0123-45',
    productNDC: '00093-0123'
  }
};

const LOCAL_PHARMACY = generatePharmacy({ id: 'phr_local', name: 'Walgreens #123' });

const server = setupServer(...defaultHandlers);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });

  window.HTMLElement.prototype.scrollIntoView = vi.fn();

  if (!customElements.get('photon-medication-search')) {
    customElements.define('photon-medication-search', MockMedicationSearchElement);
  }
});

beforeEach(() => {
  // The patient has an address so the "Address required" guard doesn't short-circuit
  // submitForm before it reaches the pharmacy check we're exercising.
  stubGoogleMaps([makeGeocodeResult(40.7128, -74.006, '1 Main, NY, NY 10001')]);

  const patientWithAddress = generatePatient({
    preferredPharmacies: [],
    address: generateAddress({ id: 'addr_1' })
  });

  server.use(
    lambdasGql.query('patient', () => HttpResponse.json({ data: { patient: patientWithAddress } })),
    lambdasGql.query('GetPatient', () =>
      HttpResponse.json({ data: { patient: patientWithAddress } })
    ),
    lambdasGql.query('GetPatientPreferredPharmaciesAndAddress', () =>
      HttpResponse.json({ data: { patient: patientWithAddress } })
    ),
    lambdasGql.query('GetLastOrder', () => HttpResponse.json({ data: { orders: [] } })),
    lambdasGql.query('GetPharmacies', () =>
      HttpResponse.json({ data: { pharmacies: [LOCAL_PHARMACY] } })
    ),
    lambdasGql.query('pharmacy', () =>
      HttpResponse.json({
        data: {
          pharmacy: {
            __typename: 'Pharmacy',
            id: LILLY_DIRECT_ID,
            NPI: null,
            NCPDP: null,
            name: LILLY_DIRECT_NAME,
            fulfillmentTypes: ['MAIL_ORDER'],
            address: {
              __typename: 'Address',
              street1: '1 Lilly Way',
              street2: null,
              city: 'Indianapolis',
              state: 'IN',
              postalCode: '46225',
              country: 'US'
            }
          }
        }
      })
    ),
    clinicalGql.query('ScreenDraftedPrescriptionsQuery', () =>
      HttpResponse.json({ data: { prescriptionScreen: { alerts: [] } } })
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

test('sends the order to the auto-routed pharmacy once the pharmacy tabs are replaced by the pharmacy card', async () => {
  const createOrderSpy = vi.fn();
  server.use(
    draftPrescriptionOf(ZEPBOUND_VIAL_TREATMENT),
    lambdasGql.mutation('createOrder', ({ variables }) => {
      createOrderSpy(variables);
      return HttpResponse.json({
        data: { createOrder: { __typename: 'Order', id: 'ord_abc' } }
      });
    })
  );

  const { user, waitForPrescribeForm, addDraftPrescription, waitForDraftPrescription } =
    renderPrescribeWorkflow({
      enableOrder: true,
      enableLocalPickup: true,
      optionalPatientAddress: true
    });

  await waitForPrescribeForm();

  // Before a draft prescription exists nothing is auto-routed, so the pharmacy
  // tabs are on screen and Local Pickup is the initially selected tab.
  expect(await screen.findByText('Local Pickup')).toBeInTheDocument();

  await addDraftPrescription();
  await waitForDraftPrescription(ZEPBOUND_VIAL_TREATMENT.name);

  // The Zepbound vial routing constraint auto-routes to LillyDirect, which swaps
  // the tabs out for the read-only "Selected Pharmacy" card.
  await waitFor(() => {
    expect(screen.queryByText('Local Pickup')).not.toBeInTheDocument();
  });
  expect(screen.getByText('Selected Pharmacy')).toBeInTheDocument();
  expect(await screen.findByText(LILLY_DIRECT_NAME)).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: /^send$/i }));

  await waitFor(() => {
    expect(createOrderSpy).toHaveBeenCalledWith(
      expect.objectContaining({ pharmacyId: LILLY_DIRECT_ID })
    );
  });

  // solid-toast renders each toast twice (visible + aria-live), so count matches.
  expect(screen.queryAllByText('Error Creating Order')).toHaveLength(0);
  expect(screen.queryAllByText(/Please choose a pharmacy for/i)).toHaveLength(0);
});

test('asks for a pharmacy when the tabs are on screen and none was selected', async () => {
  const createOrderSpy = vi.fn();
  server.use(
    draftPrescriptionOf(UNCONSTRAINED_TREATMENT),
    lambdasGql.mutation('createOrder', ({ variables }) => {
      createOrderSpy(variables);
      return HttpResponse.json({
        data: { createOrder: { __typename: 'Order', id: 'ord_abc' } }
      });
    })
  );

  const { user, waitForPrescribeForm, addDraftPrescription, waitForDraftPrescription } =
    renderPrescribeWorkflow({
      enableOrder: true,
      enableLocalPickup: true,
      optionalPatientAddress: true
    });

  await waitForPrescribeForm();
  await addDraftPrescription();
  await waitForDraftPrescription(UNCONSTRAINED_TREATMENT.name);

  // No routing constraint, so the tabs stay put and the prescriber still has to pick one.
  expect(screen.getByText('Local Pickup')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: /^send$/i }));

  expect(
    (await screen.findAllByText(/Please choose a pharmacy for Local Pickup/i)).length
  ).toBeGreaterThan(0);
  expect(createOrderSpy).not.toHaveBeenCalled();
});

const draftPrescriptionOf = (treatment: typeof ZEPBOUND_VIAL_TREATMENT) =>
  lambdasGql.mutation('CreatePrescription', ({ variables }) =>
    HttpResponse.json({
      data: {
        createPrescription: {
          __typename: 'Prescription',
          id: 'rx_123',
          externalId: null,
          dispenseAsWritten: false,
          dispenseQuantity: variables.dispenseQuantity,
          dispenseUnit: variables.dispenseUnit,
          fillsAllowed: variables.fillsAllowed,
          daysSupply: variables.daysSupply,
          instructions: variables.instructions,
          notes: variables.notes,
          effectiveDate: '2026-01-01',
          doNotFillBeforeDate: null,
          diagnoses: [],
          treatment,
          state: 'DRAFT'
        }
      }
    })
  );
