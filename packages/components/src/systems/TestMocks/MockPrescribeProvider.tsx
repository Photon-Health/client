import { PhotonClient } from '@photonhealth/sdk';
import { createContext, JSXElement, untrack } from 'solid-js';
import { vi } from 'vitest';
import { PrescribeContextType } from '../PrescribeProvider';

export const MockPrescribeContext = createContext<PrescribeContextType>();

export const mockPrescribeContextValues = () => {
  return {
    setEditingPrescription: vi.fn(),
    deletePrescription: vi.fn(),
    tryCreatePrescription: vi.fn(),
    tryUpdatePrescriptionStates: vi.fn()
  };
};

interface MockPrescribeProviderProps {
  client?: PhotonClient;
  children: JSXElement;
  mockFunctions?: ReturnType<typeof mockPrescribeContextValues>;
}

export function MockPrescribeProvider(props: MockPrescribeProviderProps) {
  const mocks = untrack(() => props.mockFunctions || mockPrescribeContextValues());

  const mockValues: PrescribeContextType = {
    // mock values
    prescriptionIds: () => [],
    isLoadingPrefills: () => false,

    // actions
    setEditingPrescription: mocks.setEditingPrescription,
    deletePrescription: mocks.deletePrescription,
    tryCreatePrescription: mocks.tryCreatePrescription,
    tryUpdatePrescriptionStates: mocks.tryUpdatePrescriptionStates
  };

  return (
    <MockPrescribeContext.Provider value={mockValues}>
      {props.children}
    </MockPrescribeContext.Provider>
  );
}
