import { render, screen } from '@solidjs/testing-library';
import PatientMedHistory, { GetPatientResponse } from './index';
import { vi } from 'vitest';
import { MockPhotonClient, MockSDKProvider } from '../TestMocks/MockSDKProvider';
import { PhotonClient } from '@photonhealth/sdk';
import {
  MockPrescribeContext,
  mockPrescribeContextValues,
  MockPrescribeProvider
} from '../TestMocks/MockPrescribeProvider';
import userEvent from '@testing-library/user-event';
import { Prescription } from '@photonhealth/sdk/dist/types';
import { useContext } from 'solid-js';

vi.mock('../SDKProvider', () => ({
  usePhotonClient: () => new MockPhotonClient()
}));

vi.mock('../PrescribeProvider', () => {
  return {
    usePrescribeOptional: () => useContext(MockPrescribeContext)
  };
});

vi.mock('../../utils/createQuery', () => ({
  createQuery: () => {
    const mockResponse: GetPatientResponse = {
      patient: {
        id: 'test-patient-id',
        treatmentHistory: [
          {
            treatment: { name: 'test-treatment-name', id: 'test-treatment-id', codes: {} },
            prescription: createPrescription()
          }
        ]
      }
    };
    return vi.fn().mockImplementation(() => mockResponse);
  }
}));

afterEach(() => {
  vi.resetAllMocks();
});

test('PatientMedHistory renders without PrescribeContext', async () => {
  const mockClient = new MockPhotonClient();

  render(() => (
    <MockSDKProvider client={mockClient as unknown as PhotonClient}>
      <PatientMedHistory
        patientId="test-patient-id"
        enableLinks={false}
        enableRefillButton={false}
      />
    </MockSDKProvider>
  ));

  expect(screen.getByText('test-treatment-name')).toBeInTheDocument();
});

test('PatientMedHistory allows refills', async () => {
  const user = userEvent.setup();
  const mockClient = new MockPhotonClient();
  const mockPrescribeFunctions = mockPrescribeContextValues();

  render(() => (
    <MockSDKProvider client={mockClient as unknown as PhotonClient}>
      <MockPrescribeProvider mockFunctions={mockPrescribeFunctions}>
        <PatientMedHistory
          patientId="test-patient-id"
          enableLinks={false}
          enableRefillButton={true}
        />
      </MockPrescribeProvider>
    </MockSDKProvider>
  ));

  await user.click(screen.getByRole('button', { name: 'Refill' }));

  expect(mockPrescribeFunctions.tryCreatePrescription).toHaveBeenCalledTimes(1);
});

function createPrescription(): Prescription {
  return {
    dispenseQuantity: 0,
    dispenseUnit: '',
    fills: [],
    id: '',
    instructions: '',
    fillsAllowed: 0,
    fillsRemaining: 0,
    state: 'DRAFT'
  } as unknown as Prescription;
}
