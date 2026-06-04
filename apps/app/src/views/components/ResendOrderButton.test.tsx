import { clinicalGql } from '@photonhealth/sdk/test-utils';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse } from 'msw';
import { beforeEach, expect, test, vi } from 'vitest';

import { makeOrder, makePatient, makePharmacy, setupHarness } from '../../test-utils';
import { ResendOrderButton } from './ResendOrderButton';

const ORDER_ID = 'ord_test';
const PATIENT_ID = 'pat_456';
const PHARMACY_ID = 'phr_original';

const pharmacy = makePharmacy({ id: PHARMACY_ID, name: 'Original Pharmacy' });
const order = makeOrder({
  id: ORDER_ID,
  patient: makePatient({ id: PATIENT_ID }),
  pharmacy
}) as Parameters<typeof ResendOrderButton>[0]['order'];

const resendOrderSpy = vi.fn();

const { server, trackSpy, renderWithProviders } = setupHarness();

beforeEach(() => {
  resendOrderSpy.mockClear();

  server.use(
    clinicalGql.mutation('ResendOrder', ({ variables }) => {
      resendOrderSpy(variables);
      return HttpResponse.json({ data: { resendOrder: true } });
    })
  );
});

async function openResend() {
  renderWithProviders(<ResendOrderButton order={order} />);
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: /resend order/i }));
  return user;
}

test('renders the Resend Order trigger button', () => {
  renderWithProviders(<ResendOrderButton order={order} />);
  expect(screen.getByRole('button', { name: /resend order/i })).toBeInTheDocument();
});

test('opens the dialog with pharmacy details and fires open analytics', async () => {
  await openResend();

  expect(await screen.findByRole('dialog')).toBeInTheDocument();
  expect(screen.getByText(/confirm resend to existing pharmacy/i)).toBeInTheDocument();
  expect(screen.getByText('Original Pharmacy')).toBeInTheDocument();

  expect(trackSpy).toHaveBeenCalledWith(
    'Customer Clicked Resend Order',
    expect.objectContaining({
      orderId: ORDER_ID,
      patientId: PATIENT_ID
    })
  );
});

test('Cancel closes the dialog, fires cancel analytics, and does not call the mutation', async () => {
  const user = await openResend();
  await screen.findByRole('dialog');

  await user.click(screen.getByRole('button', { name: /^cancel$/i }));

  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(trackSpy).toHaveBeenCalledWith(
    'Cancel Resend Order Clicked',
    expect.objectContaining({ orderId: ORDER_ID, patientId: PATIENT_ID })
  );
  expect(resendOrderSpy).not.toHaveBeenCalled();
});

test('Confirm fires mutation, shows success toast, and fires analytics on success', async () => {
  const user = await openResend();
  const dialog = await screen.findByRole('dialog');

  await user.click(within(dialog).getByRole('button', { name: /^resend order$/i }));

  await waitFor(() => {
    expect(resendOrderSpy).toHaveBeenCalledWith({ orderId: ORDER_ID });
  });

  expect(await screen.findByText(/resend successful/i)).toBeInTheDocument();
  expect(screen.getByText(/we've initiated a resend to the pharmacy/i)).toBeInTheDocument();

  expect(trackSpy).toHaveBeenCalledWith(
    'Confirm Resend Order Clicked',
    expect.objectContaining({
      buttonText: 'Resend order',
      orderId: ORDER_ID,
      patientId: PATIENT_ID,
      pharmacyId: PHARMACY_ID,
      pharmacyName: 'Original Pharmacy'
    })
  );

  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
});

test('Confirm shows error toast and fires error analytics on mutation failure', async () => {
  server.use(
    clinicalGql.mutation('ResendOrder', () =>
      HttpResponse.json({
        data: null,
        errors: [{ message: 'pharmacy not accepting orders' }]
      })
    )
  );

  const user = await openResend();
  const dialog = await screen.findByRole('dialog');

  await user.click(within(dialog).getByRole('button', { name: /^resend order$/i }));

  expect(await screen.findByText(/error resending order/i)).toBeInTheDocument();
  expect(screen.getByText(/pharmacy not accepting orders/i)).toBeInTheDocument();

  expect(trackSpy).toHaveBeenCalledWith(
    'Resend Error Message Viewed',
    expect.objectContaining({
      orderId: ORDER_ID,
      patientId: PATIENT_ID,
      pharmacyId: PHARMACY_ID
    })
  );
});
