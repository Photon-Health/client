import { OrderState } from '@photonhealth/sdk/dist/types';
import { clinicalGql, lambdasGql } from '@photonhealth/sdk/test-utils';
import { screen, within } from '@testing-library/react';
import { HttpResponse } from 'msw';
import { Route, Routes } from 'react-router-dom';
import { expect, test } from 'vitest';

import { makeAddress, makeOrder, makePatient, makePharmacy, setupHarness } from '../../test-utils';
import { OrderDetailPage } from './Order';

const ORDER_ID = 'ord_test';
const ORDER_PHARMACY_ID = 'phr_order';
const PREFERRED_PHARMACY_ID = 'phr_preferred';

const orderPharmacy = makePharmacy({
  id: ORDER_PHARMACY_ID,
  name: 'Order Pharmacy',
  phone: '+15550001111',
  address: makeAddress({
    street1: '1 Order St',
    city: 'Brooklyn',
    state: 'NY',
    postalCode: '11211'
  })
});

const preferredPharmacy = makePharmacy({
  id: PREFERRED_PHARMACY_ID,
  name: 'Preferred Pharmacy',
  phone: '+15550002222',
  address: makeAddress({
    street1: '2 Preferred Ave',
    city: 'Queens',
    state: 'NY',
    postalCode: '11385'
  })
});

const { server, renderWithProviders } = setupHarness();

type OrderOverrides = Parameters<typeof makeOrder>[0];

function mockOrderQueries(orderOverrides: OrderOverrides = {}, routingHistory: unknown[] = []) {
  const order = makeOrder({ id: ORDER_ID, ...orderOverrides });
  server.use(
    lambdasGql.query('GetOrder', () => HttpResponse.json({ data: { order } })),
    clinicalGql.query('GetOrder', () =>
      HttpResponse.json({
        data: { order: { __typename: 'Order', id: ORDER_ID, routingHistory } }
      })
    )
  );
  return order;
}

function renderOrderPage() {
  return renderWithProviders(
    <Routes>
      <Route path="/orders/:orderId" element={<OrderDetailPage />} />
    </Routes>,
    { initialEntries: [`/orders/${ORDER_ID}`] }
  );
}

test('ROUTING + no pharmacy + no preferred shows STP prompt and Select Pharmacy button, no pharmacy info', async () => {
  mockOrderQueries({
    state: OrderState.Routing,
    pharmacy: null,
    patient: makePatient({ preferredPharmacies: [] })
  });

  renderOrderPage();

  expect(await screen.findByText(/pending pharmacy selection by the patient/i)).toBeInTheDocument();
  expect(screen.getByText(/select a pharmacy for the patient if needed/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /^select pharmacy$/i })).toBeInTheDocument();

  // No pharmacy info grid rendered when there's no display pharmacy.
  expect(screen.queryByText('Name')).not.toBeInTheDocument();
  expect(screen.queryByText('Phone')).not.toBeInTheDocument();
  expect(screen.queryByText('Address')).not.toBeInTheDocument();
});

test('ROUTING + preferred pharmacy + no routing history shows 15-min window text and the preferred pharmacy info', async () => {
  mockOrderQueries({
    state: OrderState.Routing,
    pharmacy: null,
    patient: makePatient({ preferredPharmacies: [preferredPharmacy] })
  });

  renderOrderPage();

  expect(
    await screen.findByText(/pending pharmacy confirmation by the patient/i)
  ).toBeInTheDocument();
  expect(
    screen.getByText(/will be routed to the below pharmacy if the patient does not confirm/i)
  ).toBeInTheDocument();
  // In-window initial route → patient can still pick a different pharmacy.
  expect(screen.getByRole('button', { name: /^select pharmacy$/i })).toBeInTheDocument();

  // Regression: pharmacy info must fall back to the patient's preferred pharmacy
  // when the order itself doesn't have one set yet.
  expect(await screen.findByText('Preferred Pharmacy')).toBeInTheDocument();
  expect(screen.getByText('(555) 000-2222')).toBeInTheDocument();
  expect(screen.getByText(/2 Preferred Ave/)).toBeInTheDocument();
});

test('ROUTING + order pharmacy + routing history (reroute requested from patient) shows Select Pharmacy and hides pharmacy info', async () => {
  mockOrderQueries(
    {
      state: OrderState.Routing,
      pharmacy: orderPharmacy,
      patient: makePatient({ preferredPharmacies: [] })
    },
    [
      {
        __typename: 'OrderRoutingHistory',
        pharmacy: orderPharmacy,
        selector: 'PROVIDER',
        reason: null,
        createdAt: '2026-01-01T00:00:00Z'
      }
    ]
  );

  renderOrderPage();

  expect(
    await screen.findByText(/pending a pharmacy reroute selection from the patient/i)
  ).toBeInTheDocument();
  // Provider can intervene and pick a pharmacy themselves while the patient is
  // being asked to reroute.
  expect(screen.getByRole('button', { name: /^select pharmacy$/i })).toBeInTheDocument();

  // Pharmacy info is suppressed in the reroute-requested state — the
  // previously-routed pharmacy is no longer the "active" choice.
  expect(screen.queryByText('Order Pharmacy')).not.toBeInTheDocument();
  expect(screen.queryByText('Name')).not.toBeInTheDocument();
  expect(screen.queryByText('Phone')).not.toBeInTheDocument();
  expect(screen.queryByText('Address')).not.toBeInTheDocument();
});

test('PLACED + order pharmacy shows pharmacy info and no routing status card', async () => {
  mockOrderQueries({
    state: OrderState.Placed,
    pharmacy: orderPharmacy,
    patient: makePatient({ preferredPharmacies: [] })
  });

  renderOrderPage();

  expect(await screen.findByText('Order Pharmacy')).toBeInTheDocument();
  expect(screen.getByText('(555) 000-1111')).toBeInTheDocument();
  expect(screen.getByText(/1 Order St/)).toBeInTheDocument();

  // No routing status card on a placed order.
  expect(
    screen.queryByText(/pending pharmacy (selection|confirmation|reroute)/i)
  ).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /^select pharmacy$/i })).not.toBeInTheDocument();
});

test('PLACED + no order pharmacy + preferred pharmacy falls back to preferred pharmacy display (regression)', async () => {
  mockOrderQueries({
    state: OrderState.Placed,
    pharmacy: null,
    patient: makePatient({ preferredPharmacies: [preferredPharmacy] })
  });

  renderOrderPage();

  expect(await screen.findByText('Preferred Pharmacy')).toBeInTheDocument();
  expect(screen.getByText('(555) 000-2222')).toBeInTheDocument();
  expect(screen.getByText(/2 Preferred Ave/)).toBeInTheDocument();

  // No "None" placeholders should appear for the pharmacy rows.
  expect(screen.queryAllByText('None')).toHaveLength(0);
});

test('PLACED + no pharmacy + no preferred hides the pharmacy info rows entirely', async () => {
  mockOrderQueries({
    state: OrderState.Placed,
    pharmacy: null,
    patient: makePatient({ preferredPharmacies: [] })
  });

  renderOrderPage();

  // The section header doubles as a sentinel that the page mounted.
  expect(await screen.findByText('Pharmacy Information')).toBeInTheDocument();

  // displayPharmacy is undefined → the InfoGrid rows are not rendered at all.
  expect(screen.queryByText('Name')).not.toBeInTheDocument();
  expect(screen.queryByText('Phone')).not.toBeInTheDocument();
  expect(screen.queryByText('Address')).not.toBeInTheDocument();
});

test('CANCELED order still renders pharmacy info from order.pharmacy', async () => {
  mockOrderQueries({
    state: OrderState.Canceled,
    pharmacy: orderPharmacy,
    patient: makePatient({ preferredPharmacies: [] })
  });

  renderOrderPage();

  expect(await screen.findByText('Order Pharmacy')).toBeInTheDocument();
  expect(screen.getByText(/1 Order St/)).toBeInTheDocument();
  expect(
    screen.queryByText(/pending pharmacy (selection|confirmation|reroute)/i)
  ).not.toBeInTheDocument();
});

test('order.pharmacy takes precedence over patient.preferredPharmacies for display', async () => {
  mockOrderQueries({
    state: OrderState.Placed,
    pharmacy: orderPharmacy,
    patient: makePatient({ preferredPharmacies: [preferredPharmacy] })
  });

  renderOrderPage();

  expect(await screen.findByText('Order Pharmacy')).toBeInTheDocument();
  expect(screen.queryByText('Preferred Pharmacy')).not.toBeInTheDocument();
});

test('unknown order id surfaces the "Unknown Order" alert', async () => {
  server.use(
    lambdasGql.query('GetOrder', () => HttpResponse.json({ data: { order: null } })),
    clinicalGql.query('GetOrder', () =>
      HttpResponse.json({
        data: { order: { __typename: 'Order', id: ORDER_ID, routingHistory: [] } }
      })
    )
  );

  renderOrderPage();

  const alert = await screen.findByRole('alert');
  expect(within(alert).getByText(/unknown order/i)).toBeInTheDocument();
});
