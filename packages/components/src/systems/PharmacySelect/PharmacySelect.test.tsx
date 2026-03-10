import { render, screen } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { useContext } from 'solid-js';
import { vi } from 'vitest';
import { MockPrescribeContext, MockPrescribeProvider } from '../TestMocks/MockPrescribeProvider';
import {
  MockPrescribeEventDispatchContext,
  MockPrescribeEventDispatchProvider
} from '../TestMocks/MockPrescribeEventDispatchProvider';
import {
  MockPharmacySelectionContext,
  MockPharmacySelectionProvider
} from '../TestMocks/MockPharmacySelectionProvider';
import { PharmacySelectionContextType } from '../PharmacySelect';
import { PharmacySelect } from './PharmacySelect';

vi.mock('../PrescribeProvider', () => {
  return {
    usePrescribe: () => useContext(MockPrescribeContext)
  };
});

vi.mock('../PrescribeEventDispatchProvider', () => {
  return {
    usePrescribeEventDispatch: () => useContext(MockPrescribeEventDispatchContext)
  };
});

vi.mock('../PharmacySelect', () => {
  return {
    usePharmacySelectionContext: () => useContext(MockPharmacySelectionContext)
  };
});

// Mock child components that make SDK/GraphQL calls
vi.mock('../PharmacySearch', () => ({
  default: () => <div data-testid="pickup-search">Pickup Search Mock</div>
}));

vi.mock('./SendToPatient', () => ({
  SendToPatient: () => <div data-testid="send-to-patient">Send To Patient Mock</div>
}));

vi.mock('../PharmacySearch/MailOrderPharmacySearch', () => ({
  MailOrderPharmacySearch: () => <div data-testid="mail-order-search">Mail Order Search Mock</div>
}));

vi.mock('./MailOrderPharmacy', () => ({
  MailOrderPharmacy: (props: { pharmacyId: string }) => (
    <span data-testid={`mail-pharmacy-${props.pharmacyId}`}>{props.pharmacyId}</span>
  )
}));

test('prevents pharmacy selection when address is missing', () => {
  render(() => (
    <MockPrescribeProvider>
      <MockPrescribeEventDispatchProvider>
        <MockPharmacySelectionProvider
          enableSendToPatient={false}
          enableLocalPickup={true}
          enableDeliveryPharmacies={false}
        >
          <PharmacySelect address="" patientIds={['pat_123']} />
        </MockPharmacySelectionProvider>
      </MockPrescribeEventDispatchProvider>
    </MockPrescribeProvider>
  ));

  expect(
    screen.getByText('Please add a patient address to select a pharmacy.')
  ).toBeInTheDocument();
});

test('tab switching updates fulfillment type and preserves pharmacy selection per tab', async () => {
  const user = userEvent.setup();
  let ctxRef!: PharmacySelectionContextType;

  const ContextSpy = () => {
    ctxRef = useContext(MockPharmacySelectionContext)!;
    return null;
  };

  render(() => (
    <MockPrescribeProvider>
      <MockPrescribeEventDispatchProvider>
        <MockPharmacySelectionProvider
          enableSendToPatient={true}
          enableLocalPickup={true}
          enableDeliveryPharmacies={true}
          mailOrderPharmacyIds={['phr_mail_1', 'phr_mail_2']}
        >
          <ContextSpy />
          <PharmacySelect address="123 Main St, New York, NY 10001" patientIds={['pat_123']} />
        </MockPharmacySelectionProvider>
      </MockPrescribeEventDispatchProvider>
    </MockPrescribeProvider>
  ));

  expect(ctxRef.fulfillmentType()).toBeUndefined();
  expect(screen.getByText('Send To Patient Mock')).toBeInTheDocument();

  await user.click(screen.getByText('Local Pickup'));
  expect(ctxRef.fulfillmentType()).toBe('PICK_UP');
  expect(ctxRef.pharmacyId()).toBeUndefined();

  await user.click(screen.getByText('Mail Order'));
  expect(ctxRef.fulfillmentType()).toBe('MAIL_ORDER');
  expect(ctxRef.pharmacyId()).toBeUndefined();

  await user.click(screen.getByTestId('mail-pharmacy-phr_mail_1'));
  expect(ctxRef.pharmacyId()).toBe('phr_mail_1');

  await user.click(screen.getByText('Send to Patient'));
  expect(ctxRef.fulfillmentType()).toBeUndefined();
  expect(ctxRef.pharmacyId()).toBeUndefined();

  await user.click(screen.getByText('Mail Order'));
  expect(ctxRef.fulfillmentType()).toBe('MAIL_ORDER');
  expect(ctxRef.pharmacyId()).toBe('phr_mail_1');

  await user.click(screen.getByTestId('mail-pharmacy-phr_mail_2'));
  expect(ctxRef.pharmacyId()).toBe('phr_mail_2');

  await user.click(screen.getByText('Local Pickup'));
  expect(ctxRef.fulfillmentType()).toBe('PICK_UP');
  expect(ctxRef.pharmacyId()).toBeUndefined();

  await user.click(screen.getByText('Mail Order'));
  expect(ctxRef.pharmacyId()).toBe('phr_mail_2');
});
