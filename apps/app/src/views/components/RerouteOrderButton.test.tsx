import { ApolloProvider } from '@apollo/client';
import { ChakraProvider } from '@chakra-ui/react';
import { PhotonClient } from '@photonhealth/sdk';
import type { Order, Pharmacy } from '@photonhealth/sdk/dist/types';
import { FulfillmentType, OrderState } from '@photonhealth/sdk/dist/types';
import { clinicalGql, defaultHandlers, lambdasGql } from '@photonhealth/sdk/test-utils';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { ProviderAnalyticsProvider } from '../../hooks/useProviderAnalytics';
import { GET_ORDER } from '../../queries';
import { RerouteOrderButton } from './RerouteOrderButton';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const ORDER_ID = 'ord_test123';
const PATIENT_ID = 'pat_456';
const ORIGINAL_PHARMACY_ID = 'phr_original';
const NEW_PHARMACY_ID = 'phr_new';

const ORIGINAL_PHARMACY = {
  __typename: 'Pharmacy',
  id: ORIGINAL_PHARMACY_ID,
  name: 'Original Pharmacy',
  phone: '+15551110000',
  address: {
    __typename: 'Address',
    city: 'Brooklyn',
    country: 'US',
    postalCode: '11211',
    state: 'NY',
    street1: '123 Main St',
    street2: null
  }
} as unknown as Pharmacy;

const NEW_PHARMACY = {
  __typename: 'Pharmacy',
  id: NEW_PHARMACY_ID,
  name: 'New Pharmacy',
  phone: '+15552220000',
  address: {
    __typename: 'Address',
    city: 'Queens',
    country: 'US',
    postalCode: '11375',
    state: 'NY',
    street1: '456 Side St',
    street2: null
  }
} as unknown as Pharmacy;

const FIXTURE_ORDER = {
  __typename: 'Order',
  id: ORDER_ID,
  externalId: null,
  state: OrderState.Routing,
  address: null,
  fills: [
    {
      __typename: 'Fill',
      id: 'fill_1',
      prescription: {
        __typename: 'Prescription',
        id: 'rx_1',
        dispenseQuantity: 30,
        dispenseUnit: 'tablet',
        fillsAllowed: 1,
        instructions: 'Take 1 daily'
      },
      treatment: { __typename: 'Treatment', id: 'trt_1', name: 'Amoxicillin' },
      state: 'NEW',
      requestedAt: '2026-05-01T00:00:00Z',
      filledAt: null
    }
  ],
  patient: {
    __typename: 'Patient',
    id: PATIENT_ID,
    externalId: null,
    name: { __typename: 'Name', full: 'Sally Patient' },
    dateOfBirth: '1990-01-01',
    sex: 'FEMALE',
    gender: 'female',
    email: 'sally@example.com',
    phone: '+17185551234'
  },
  pharmacy: ORIGINAL_PHARMACY,
  fulfillment: null,
  exceptions: [],
  createdAt: '2026-05-01T00:00:00Z'
} as unknown as Order;

// ---------------------------------------------------------------------------
// MSW + Apollo client setup
// ---------------------------------------------------------------------------

// Spies for asserting the right operations fired with the right variables.
const rerouteOrderSpy = vi.fn();
const getPharmacySpy = vi.fn();

const server = setupServer(
  ...defaultHandlers,
  // RerouteOrder lives on the clinical (services) API.
  clinicalGql.mutation('RerouteOrder', async ({ variables }) => {
    rerouteOrderSpy(variables);
    return HttpResponse.json({ data: { rerouteOrder: true } });
  }),
  // The routing-history GetOrder lives on clinical too — empty history is fine.
  clinicalGql.query('GetOrder', () =>
    HttpResponse.json({
      data: { order: { __typename: 'Order', id: ORDER_ID, routingHistory: [] } }
    })
  ),
  // PHARMACY_QUERY runs against the lambdas client to fetch the new pharmacy
  // for analytics + the cross-client cache update.
  lambdasGql.query('GetPharmacy', ({ variables }) => {
    getPharmacySpy(variables);
    return HttpResponse.json({ data: { pharmacy: NEW_PHARMACY } });
  })
);

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});
afterAll(() => server.close());

// Use a real PhotonClient so we get a real Apollo Client per endpoint
// (apollo = lambdas, apolloClinical = services). MSW intercepts the HTTP.
const photonClient = new PhotonClient({ clientId: 'test', env: 'tau' });
photonClient.authentication.getAccessToken = vi.fn(async () => 'test-token');

vi.mock('@photonhealth/react', () => ({
  usePhoton: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: { org_id: 'org_1' },
    clinicalClient: photonClient.apolloClinical
  })
}));

const rudderTrackSpy = vi.fn();
const rudderIdentifySpy = vi.fn();
vi.mock('../../configs/providerAnalytics', () => ({
  getProviderAnalytics: () => ({
    track: rudderTrackSpy,
    isInitialized: true,
    identify: rudderIdentifySpy
  })
}));

beforeEach(async () => {
  // Reset both Apollo caches so tests are isolated.
  await photonClient.apollo.clearStore();
  await photonClient.apolloClinical.clearStore();
});

// ---------------------------------------------------------------------------
// Render helpers
// ---------------------------------------------------------------------------

function renderRerouteButton(order: Order = FIXTURE_ORDER) {
  // Pre-populate the lambdas cache with GET_ORDER so the mutation's
  // cross-client `update` callback has something to read + write.
  photonClient.apollo.writeQuery({
    query: GET_ORDER,
    variables: { id: order.id },
    data: { order }
  });

  return render(
    <MemoryRouter>
      <ChakraProvider>
        <ApolloProvider client={photonClient.apollo}>
          <ProviderAnalyticsProvider>
            <RerouteOrderButton order={order} organizationId="org_1" />
          </ProviderAnalyticsProvider>
        </ApolloProvider>
      </ChakraProvider>
    </MemoryRouter>
  );
}

function getCachedOrder(): Order | undefined {
  return photonClient.apollo.readQuery<{ order: Order }>({
    query: GET_ORDER,
    variables: { id: ORDER_ID }
  })?.order;
}

async function openReroute(order: Order = FIXTURE_ORDER) {
  renderRerouteButton(order);
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: /reroute order/i }));
  return user;
}

const getPharmacySelectElement = () => screen.findByTestId('pharmacy-select');

function dispatchPharmacySelected(
  el: HTMLElement,
  detail: { pharmacyId?: string; fulfillmentType?: string }
) {
  el.dispatchEvent(
    new CustomEvent('photon-pharmacy-selected', { bubbles: true, composed: true, detail })
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test('renders the Reroute Order trigger button', () => {
  renderRerouteButton();
  expect(screen.getByRole('button', { name: /reroute order/i })).toBeInTheDocument();
});

test('opens the dialog with photon-pharmacy-select and fires open analytics', async () => {
  await openReroute();

  expect(await screen.findByRole('dialog')).toBeInTheDocument();
  const pharmacySelect = await getPharmacySelectElement();
  expect(pharmacySelect).toHaveAttribute('patient-id', PATIENT_ID);
  expect(pharmacySelect).toHaveAttribute('pharmacy-id', ORIGINAL_PHARMACY_ID);

  expect(rudderTrackSpy).toHaveBeenCalledWith(
    'Customer Clicked Reroute Order',
    expect.objectContaining({
      orderId: ORDER_ID,
      patientId: PATIENT_ID,
      medicationIds: ['trt_1'],
      medicationNames: ['Amoxicillin']
    })
  );
});

test('Cancel closes the dialog and fires cancel analytics — no mutation', async () => {
  const user = await openReroute();
  await screen.findByRole('dialog');

  await user.click(screen.getByRole('button', { name: /^cancel$/i }));

  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(rudderTrackSpy).toHaveBeenCalledWith(
    'Cancel Reroute Order Clicked',
    expect.objectContaining({ orderId: ORDER_ID })
  );
  expect(rerouteOrderSpy).not.toHaveBeenCalled();
});

test('Confirm button is disabled when a tab is selected but no pharmacy is chosen', async () => {
  await openReroute();
  const el = await getPharmacySelectElement();

  // User picked the "Local Pickup" tab but hasn't chosen a pharmacy yet.
  dispatchPharmacySelected(el, {
    fulfillmentType: FulfillmentType.PickUp,
    pharmacyId: undefined
  });

  await waitFor(() => {
    expect(screen.getByRole('button', { name: /confirm reroute/i })).toBeDisabled();
  });
});

test('Confirm fires mutation with selected pharmacy, updates lambdas cache, and fires analytics', async () => {
  const user = await openReroute();
  const el = await getPharmacySelectElement();

  dispatchPharmacySelected(el, {
    fulfillmentType: FulfillmentType.PickUp,
    pharmacyId: NEW_PHARMACY_ID
  });

  await user.click(screen.getByRole('button', { name: /confirm reroute/i }));

  // Mutation called against the clinical client with the chosen pharmacy.
  await waitFor(() => {
    expect(rerouteOrderSpy).toHaveBeenCalledWith({
      orderId: ORDER_ID,
      pharmacyId: NEW_PHARMACY_ID
    });
  });

  // GetPharmacy was fetched on the lambdas client (for both analytics name + cache write).
  expect(getPharmacySpy).toHaveBeenCalledWith({ id: NEW_PHARMACY_ID });

  expect(rudderTrackSpy).toHaveBeenCalledWith(
    'Confirm Reroute Order Clicked',
    expect.objectContaining({
      orderId: ORDER_ID,
      pharmacyId: NEW_PHARMACY_ID,
      pharmacyName: 'New Pharmacy',
      routingType: 'Local Pick-up'
    })
  );

  // Lambdas cache for GET_ORDER reflects the new pharmacy + Pending state.
  await waitFor(() => {
    const cached = getCachedOrder();
    expect(cached?.state).toBe(OrderState.Pending);
    expect(cached?.pharmacy?.id).toBe(NEW_PHARMACY_ID);
  });

  // Dialog closes on success.
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});

test('Confirm with no pharmacy (Send to Patient) flips order back to Routing in cache', async () => {
  const user = await openReroute();
  const el = await getPharmacySelectElement();

  // Send-to-Patient flow: no pharmacy chosen, fulfillmentType is undefined → confirm enabled.
  dispatchPharmacySelected(el, { fulfillmentType: undefined, pharmacyId: undefined });

  await user.click(screen.getByRole('button', { name: /confirm reroute/i }));

  await waitFor(() => {
    expect(rerouteOrderSpy).toHaveBeenCalledWith({ orderId: ORDER_ID, pharmacyId: '' });
  });

  // No PHARMACY_QUERY since there's no chosen pharmacy.
  expect(getPharmacySpy).not.toHaveBeenCalled();

  // Cache flips to Routing
  await waitFor(() => {
    expect(getCachedOrder()?.state).toBe(OrderState.Routing);
  });
});

test('Confirm shows error toast and fires error analytics when mutation fails', async () => {
  server.use(
    clinicalGql.mutation('RerouteOrder', () =>
      HttpResponse.json({
        data: null,
        errors: [{ message: 'pharmacy not accepting orders' }]
      })
    )
  );

  const user = await openReroute();
  const el = await getPharmacySelectElement();
  dispatchPharmacySelected(el, {
    fulfillmentType: FulfillmentType.PickUp,
    pharmacyId: NEW_PHARMACY_ID
  });

  await user.click(screen.getByRole('button', { name: /confirm reroute/i }));

  expect(await screen.findByText(/error rerouting the order/i)).toBeInTheDocument();
  expect(rudderTrackSpy).toHaveBeenCalledWith(
    'Reroute Error Message Viewed',
    expect.objectContaining({ orderId: ORDER_ID })
  );

  // Dialog remains open so the user can retry or cancel.
  expect(screen.getByRole('dialog')).toBeInTheDocument();

  // Cache not advanced — still the original pharmacy.
  expect(getCachedOrder()?.state).toBe(OrderState.Routing);
  expect(getCachedOrder()?.pharmacy?.id).toBe(ORIGINAL_PHARMACY_ID);
});
