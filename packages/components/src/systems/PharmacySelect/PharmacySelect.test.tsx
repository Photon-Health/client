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
import {
  MockSelectedPatientContext,
  MockSelectedPatientProvider
} from '../TestMocks/MockSelectedPatientProvider';
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

vi.mock('../SelectedPatientProvider', () => {
  return {
    useSelectedPatientContext: () => useContext(MockSelectedPatientContext)
  };
});

// Mock child components that make SDK/GraphQL calls
vi.mock('../PharmacySearch', () => ({
  default: () => <div data-testid="pickup-search">Pickup Search Mock</div>
}));

vi.mock('../PharmacySearch/MailOrderPharmacySearch', () => ({
  MailOrderPharmacySearch: () => <div data-testid="mail-order-search">Mail Order Search Mock</div>
}));

vi.mock('./MailOrderPharmacy', () => ({
  MailOrderPharmacy: (props: { pharmacyId: string }) => (
    <span data-testid={`mail-pharmacy-${props.pharmacyId}`}>{props.pharmacyId}</span>
  )
}));

vi.mock('./PharmacySelectionCard', () => ({
  PharmacySelectionCard: (props: {
    patientId: string;
    providerSelectedPharmacy?: { name: string; address?: string };
    onChangePharmacy: () => void;
    onLetPatientChoose: () => void;
  }) => (
    <div data-testid="pharmacy-selection-card">
      <span data-testid="card-state">
        {props.providerSelectedPharmacy ? 'providerSelected' : 'patientWillSelect'}
      </span>
      <span data-testid="card-pharmacy-name">{props.providerSelectedPharmacy?.name || ''}</span>
      <button data-testid="card-change" onClick={() => props.onChangePharmacy()}>
        Change
      </button>
      <button data-testid="card-let-patient-choose" onClick={() => props.onLetPatientChoose()}>
        Let patient choose
      </button>
    </div>
  )
}));

test('prevents pharmacy selection when address is missing (legacy UX)', () => {
  render(() => (
    <MockPrescribeEventDispatchProvider>
      <MockPharmacySelectionProvider
        enableSendToPatient={false}
        enableLocalPickup={true}
        enableDeliveryPharmacies={false}
      >
        <MockPrescribeProvider>
          <PharmacySelect address="" patientIds={['pat_123']} />
        </MockPrescribeProvider>
      </MockPharmacySelectionProvider>
    </MockPrescribeEventDispatchProvider>
  ));

  expect(
    screen.getByText('Please add a patient address to select a pharmacy.')
  ).toBeInTheDocument();
});

test('legacy UX: tab switching updates fulfillment type and preserves pharmacy selection per tab', async () => {
  const user = userEvent.setup();
  let ctxRef!: PharmacySelectionContextType;

  const ContextSpy = () => {
    ctxRef = useContext(MockPharmacySelectionContext)!;
    return null;
  };

  render(() => (
    <MockPrescribeEventDispatchProvider>
      <MockPharmacySelectionProvider
        enableSendToPatient={false}
        enableLocalPickup={true}
        enableDeliveryPharmacies={true}
        mailOrderPharmacyIds={['phr_mail_1', 'phr_mail_2']}
      >
        <MockPrescribeProvider>
          <ContextSpy />
          <PharmacySelect address="123 Main St, New York, NY 10001" patientIds={['pat_123']} />
        </MockPrescribeProvider>
      </MockPharmacySelectionProvider>
    </MockPrescribeEventDispatchProvider>
  ));

  // Legacy UX starts with first tab (Local Pickup) active
  expect(ctxRef.fulfillmentType()).toBe('PICK_UP');

  await user.click(screen.getByText('Mail Order'));
  expect(ctxRef.fulfillmentType()).toBe('MAIL_ORDER');
  expect(ctxRef.pharmacyId()).toBeUndefined();

  await user.click(screen.getByTestId('mail-pharmacy-phr_mail_1'));
  expect(ctxRef.pharmacyId()).toBe('phr_mail_1');

  await user.click(screen.getByText('Local Pickup'));
  expect(ctxRef.fulfillmentType()).toBe('PICK_UP');
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

test('new UX: shows pharmacy selection card and collapsible toggle', async () => {
  const user = userEvent.setup();
  let ctxRef!: PharmacySelectionContextType;

  const ContextSpy = () => {
    ctxRef = useContext(MockPharmacySelectionContext)!;
    return null;
  };

  render(() => (
    <MockPrescribeEventDispatchProvider>
      <MockPharmacySelectionProvider
        enableSendToPatient={true}
        enableLocalPickup={true}
        enableDeliveryPharmacies={true}
        mailOrderPharmacyIds={['phr_mail_1']}
      >
        <MockPrescribeProvider>
          <ContextSpy />
          <PharmacySelect address="123 Main St, New York, NY 10001" patientIds={['pat_123']} />
        </MockPrescribeProvider>
      </MockPharmacySelectionProvider>
    </MockPrescribeEventDispatchProvider>
  ));

  // Default state: patient will select, fulfillment undefined
  expect(ctxRef.fulfillmentType()).toBeUndefined();
  expect(screen.getByTestId('pharmacy-selection-card')).toBeInTheDocument();
  expect(screen.getByTestId('card-state')).toHaveTextContent('patientWillSelect');

  // Toggle should be visible
  const toggle = screen.getByText('Choose a pharmacy yourself');
  expect(toggle).toBeInTheDocument();

  // Tabs should NOT be visible initially
  expect(screen.queryByText('Local Pickup')).not.toBeInTheDocument();

  // Expand toggle
  await user.click(toggle);

  // Now tabs should be visible (Local Pickup and Mail Order, no Send to Patient)
  expect(screen.getByText('Local Pickup')).toBeInTheDocument();
  expect(screen.getByText('Mail Order')).toBeInTheDocument();
  expect(screen.queryByText('Send to Patient')).not.toBeInTheDocument();
});

test('new UX: "Let the patient choose instead" resets state', async () => {
  const user = userEvent.setup();
  let ctxRef!: PharmacySelectionContextType;

  const ContextSpy = () => {
    ctxRef = useContext(MockPharmacySelectionContext)!;
    return null;
  };

  render(() => (
    <MockPrescribeEventDispatchProvider>
      <MockPharmacySelectionProvider
        enableSendToPatient={true}
        enableLocalPickup={true}
        enableDeliveryPharmacies={false}
      >
        <MockPrescribeProvider>
          <ContextSpy />
          <PharmacySelect address="123 Main St, New York, NY 10001" patientIds={['pat_123']} />
        </MockPrescribeProvider>
      </MockPharmacySelectionProvider>
    </MockPrescribeEventDispatchProvider>
  ));

  // Default state: fulfillment type is undefined (patient will select)
  expect(ctxRef.fulfillmentType()).toBeUndefined();

  // Simulate having a pharmacy selected by setting one
  ctxRef.setPharmacyId('phr_some_pharmacy');
  ctxRef.setFulfillmentType('PICK_UP' as any);
  expect(ctxRef.pharmacyId()).toBe('phr_some_pharmacy');

  // Click "Let patient choose" button on the card
  await user.click(screen.getByTestId('card-let-patient-choose'));

  // State should be reset
  expect(ctxRef.fulfillmentType()).toBeUndefined();
  expect(ctxRef.pharmacyId()).toBeUndefined();
});

test('new UX: hides toggle when no provider tabs available', () => {
  render(() => (
    <MockPrescribeEventDispatchProvider>
      <MockPharmacySelectionProvider
        enableSendToPatient={true}
        enableLocalPickup={false}
        enableDeliveryPharmacies={false}
      >
        <MockPrescribeProvider>
          <PharmacySelect address="123 Main St, New York, NY 10001" patientIds={['pat_123']} />
        </MockPrescribeProvider>
      </MockPharmacySelectionProvider>
    </MockPrescribeEventDispatchProvider>
  ));

  // Card should be visible
  expect(screen.getByTestId('pharmacy-selection-card')).toBeInTheDocument();

  // Toggle should NOT be visible (no local pickup or mail order)
  expect(screen.queryByText('Choose a pharmacy yourself')).not.toBeInTheDocument();
});

test('prevents pharmacy selection when address is missing (new UX)', async () => {
  const user = userEvent.setup();

  render(() => (
    <MockPrescribeEventDispatchProvider>
      <MockPharmacySelectionProvider
        enableSendToPatient={true}
        enableLocalPickup={true}
        enableDeliveryPharmacies={false}
      >
        <MockPrescribeProvider>
          <PharmacySelect address="" patientIds={['pat_123']} />
        </MockPrescribeProvider>
      </MockPharmacySelectionProvider>
    </MockPrescribeEventDispatchProvider>
  ));

  // Expand toggle
  await user.click(screen.getByText('Choose a pharmacy yourself'));

  expect(
    screen.getByText('Please add a patient address to select a pharmacy.')
  ).toBeInTheDocument();
});
