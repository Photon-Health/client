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
import { Prescription, PrescriptionState, SexType } from '@photonhealth/sdk/dist/types';
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
    effectiveDate: undefined,
    expirationDate: undefined,
    fills: [],
    id: '',
    instructions: '',
    patient: {
      __typename: undefined,
      address: undefined,
      allergies: undefined,
      dateOfBirth: undefined,
      email: undefined,
      externalId: undefined,
      gender: undefined,
      id: '',
      medicationHistory: undefined,
      name: {
        __typename: undefined,
        first: '',
        full: '',
        last: '',
        middle: undefined,
        title: undefined
      },
      orders: undefined,
      phone: undefined,
      preferredPharmacies: undefined,
      prescriptions: undefined,
      sex: SexType.Female,
      benefits: null
    },
    prescriber: {
      __typename: undefined,
      NPI: undefined,
      address: undefined,
      email: undefined,
      externalId: undefined,
      fax: undefined,
      id: '',
      name: {
        __typename: undefined,
        first: '',
        full: '',
        last: '',
        middle: undefined,
        title: undefined
      },
      organizations: [],
      phone: undefined
    },
    fillsAllowed: 0,
    fillsRemaining: 0,
    state: PrescriptionState.Draft,
    treatment: {
      codes: {
        __typename: undefined,
        HCPCS: undefined,
        SKU: undefined,
        packageNDC: undefined,
        productNDC: undefined,
        rxcui: undefined
      },
      description: undefined,
      id: '',
      name: '',
      __typename: undefined
    },
    writtenAt: undefined
  };
}
