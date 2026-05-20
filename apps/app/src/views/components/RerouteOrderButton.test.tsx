import { FulfillmentType, OrderState } from '@photonhealth/sdk/dist/types';
import { clinicalGql, lambdasGql } from '@photonhealth/sdk/test-utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse } from 'msw';
import { beforeEach, expect, test, vi } from 'vitest';

import {
  dispatchCustomEvent,
  makeOrder,
  makePatient,
  makePharmacy,
  setupHarness
} from '../../test-utils';
import { GET_ORDER } from '../../queries';
import { RerouteOrderButton } from './RerouteOrderButton';

const ORDER_ID = 'ord_test';
const PATIENT_ID = 'pat_456';
const ORIGINAL_PHARMACY_ID = 'phr_original';
const NEW_PHARMACY_ID = 'phr_new';

const originalPharmacy = makePharmacy({
  id: ORIGINAL_PHARMACY_ID,
  name: 'Original Pharmacy'
});
const newPharmacy = makePharmacy({ id: NEW_PHARMACY_ID, name: 'New Pharmacy' });
const order = makeOrder({
  id: ORDER_ID,
  patient: makePatient({ id: PATIENT_ID }),
  pharmacy: originalPharmacy
});

// Per-test MSW spies.
const rerouteOrderSpy = vi.fn();
const getPharmacySpy = vi.fn();

const { server, photonClient, trackSpy, renderWithProviders } = setupHarness();

beforeEach(() => {
  rerouteOrderSpy.mockClear();
  getPharmacySpy.mockClear();

  // Pre-populate the lambdas cache so the mutation's cross-client `update`
  // callback has data to read + write.
  photonClient.apollo.writeQuery({
    query: GET_ORDER,
    variables: { id: ORDER_ID },
    data: { order }
  });

  server.use(
    clinicalGql.mutation('RerouteOrder', ({ variables }) => {
      rerouteOrderSpy(variables);
      return HttpResponse.json({ data: { rerouteOrder: true } });
    }),
    clinicalGql.query('GetOrder', () =>
      HttpResponse.json({
        data: { order: { __typename: 'Order', id: ORDER_ID, routingHistory: [] } }
      })
    ),
    lambdasGql.query('GetPharmacy', ({ variables }) => {
      getPharmacySpy(variables);
      return HttpResponse.json({ data: { pharmacy: newPharmacy } });
    })
  );
});

async function openReroute() {
  renderWithProviders(<RerouteOrderButton order={order} organizationId="org_1" />);
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: /reroute order/i }));
  return user;
}

const getPharmacySelect = () => screen.findByTestId('pharmacy-select');

const getCachedOrder = () =>
  photonClient.apollo.readQuery<{ order: typeof order }>({
    query: GET_ORDER,
    variables: { id: ORDER_ID }
  })?.order;

test('renders the Reroute Order trigger button', () => {
  renderWithProviders(<RerouteOrderButton order={order} organizationId="org_1" />);
  expect(screen.getByRole('button', { name: /reroute order/i })).toBeInTheDocument();
});

test('opens the dialog with photon-pharmacy-select and fires open analytics', async () => {
  await openReroute();

  expect(await screen.findByRole('dialog')).toBeInTheDocument();
  const pharmacySelect = await getPharmacySelect();
  expect(pharmacySelect).toHaveAttribute('patient-id', PATIENT_ID);
  expect(pharmacySelect).toHaveAttribute('pharmacy-id', ORIGINAL_PHARMACY_ID);

  expect(trackSpy).toHaveBeenCalledWith(
    'Customer Clicked Reroute Order',
    expect.objectContaining({
      orderId: ORDER_ID,
      patientId: PATIENT_ID
    })
  );
});

test('Cancel closes the dialog, fires cancel analytics, and does not call the mutation', async () => {
  const user = await openReroute();
  await screen.findByRole('dialog');

  await user.click(screen.getByRole('button', { name: /^cancel$/i }));

  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(trackSpy).toHaveBeenCalledWith(
    'Cancel Reroute Order Clicked',
    expect.objectContaining({ orderId: ORDER_ID })
  );
  expect(rerouteOrderSpy).not.toHaveBeenCalled();
});

test('Confirm button is disabled when a tab is selected but no pharmacy is chosen', async () => {
  await openReroute();
  const el = await getPharmacySelect();

  dispatchCustomEvent(el, 'photon-pharmacy-selected', {
    fulfillmentType: FulfillmentType.PickUp,
    pharmacyId: undefined
  });

  await waitFor(() => {
    expect(screen.getByRole('button', { name: /confirm reroute/i })).toBeDisabled();
  });
});

test('Confirm fires mutation, updates lambdas cache, and fires analytics on success', async () => {
  const user = await openReroute();
  const el = await getPharmacySelect();

  dispatchCustomEvent(el, 'photon-pharmacy-selected', {
    fulfillmentType: FulfillmentType.PickUp,
    pharmacyId: NEW_PHARMACY_ID
  });

  await user.click(screen.getByRole('button', { name: /confirm reroute/i }));

  await waitFor(() => {
    expect(rerouteOrderSpy).toHaveBeenCalledWith({
      orderId: ORDER_ID,
      pharmacyId: NEW_PHARMACY_ID
    });
  });

  expect(getPharmacySpy).toHaveBeenCalledWith({ id: NEW_PHARMACY_ID });
  expect(trackSpy).toHaveBeenCalledWith(
    'Confirm Reroute Order Clicked',
    expect.objectContaining({
      orderId: ORDER_ID,
      pharmacyId: NEW_PHARMACY_ID,
      pharmacyName: 'New Pharmacy',
      routingType: 'Local Pick-up'
    })
  );

  await waitFor(() => {
    const cached = getCachedOrder();
    expect(cached?.state).toBe(OrderState.Pending);
    expect(cached?.pharmacy?.id).toBe(NEW_PHARMACY_ID);
  });

  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});

test('Confirm with no pharmacy (Send to Patient) flips cache state back to Routing', async () => {
  const user = await openReroute();
  const el = await getPharmacySelect();

  dispatchCustomEvent(el, 'photon-pharmacy-selected', {
    fulfillmentType: undefined,
    pharmacyId: undefined
  });

  await user.click(screen.getByRole('button', { name: /confirm reroute/i }));

  await waitFor(() => {
    expect(rerouteOrderSpy).toHaveBeenCalledWith({ orderId: ORDER_ID, pharmacyId: '' });
  });

  expect(getPharmacySpy).not.toHaveBeenCalled();

  // NB: the production cache update writes `pharmacy: newPharmacy || undefined`,
  // and Apollo leaves the existing pharmacy reference in place when given
  // `undefined`, so we assert on the state transition rather than pharmacy clear.
  await waitFor(() => expect(getCachedOrder()?.state).toBe(OrderState.Routing));
});

test('Confirm shows error toast and fires error analytics on mutation failure', async () => {
  server.use(
    clinicalGql.mutation('RerouteOrder', () =>
      HttpResponse.json({
        data: null,
        errors: [{ message: 'pharmacy not accepting orders' }]
      })
    )
  );

  const user = await openReroute();
  const el = await getPharmacySelect();
  dispatchCustomEvent(el, 'photon-pharmacy-selected', {
    fulfillmentType: FulfillmentType.PickUp,
    pharmacyId: NEW_PHARMACY_ID
  });

  await user.click(screen.getByRole('button', { name: /confirm reroute/i }));

  expect(await screen.findByText(/error rerouting the order/i)).toBeInTheDocument();
  expect(trackSpy).toHaveBeenCalledWith(
    'Reroute Error Message Viewed',
    expect.objectContaining({ orderId: ORDER_ID })
  );

  // Dialog remains open so the user can retry or cancel.
  expect(screen.getByRole('dialog')).toBeInTheDocument();

  // Cache not advanced.
  expect(getCachedOrder()?.state).toBe(OrderState.Routing);
  expect(getCachedOrder()?.pharmacy?.id).toBe(ORIGINAL_PHARMACY_ID);
});
