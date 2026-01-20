import { render, screen } from '@solidjs/testing-library';
import { useContext } from 'solid-js';
import { vi } from 'vitest';
import { MockPrescribeContext, MockPrescribeProvider } from '../TestMocks/MockPrescribeProvider';
import { PharmacySelect } from './PharmacySelect';

vi.mock('../PrescribeProvider', () => {
  return {
    usePrescribe: () => useContext(MockPrescribeContext)
  };
});

test('prevents pharmacy selection when address is missing', () => {
  render(() => (
    <MockPrescribeProvider>
      <PharmacySelect
        enableSendToPatient={false}
        enableLocalPickup={true}
        enableDeliveryPharmacies={false}
        address=""
        patientIds={['pat_123']}
        setFufillmentType={vi.fn()}
        setPharmacyId={vi.fn()}
      />
    </MockPrescribeProvider>
  ));

  expect(
    screen.getByText('Please add a patient address to select a pharmacy.')
  ).toBeInTheDocument();
});
