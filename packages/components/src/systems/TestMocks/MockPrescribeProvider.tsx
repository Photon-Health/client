import { PhotonClient } from '@photonhealth/sdk';
import { createContext, JSXElement, untrack } from 'solid-js';
import { vi } from 'vitest';
import { PrescribeContextType } from '../PrescribeProvider';

export const MockPrescribeContext = createContext<PrescribeContextType>();

export const mockPrescribeContextValues = () => {
  return {
    deletePrescription: vi.fn(),
    tryCreatePrescription: vi.fn(),
    tryUpdatePrescriptionStates: vi.fn(),
    setDidSelectOtherCoverageOption: vi.fn()
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
    coverageOptions: () => [],
    selectedCoverageOption: () => undefined,
    // mock actions
    deletePrescription: mocks.deletePrescription,
    tryCreatePrescription: mocks.tryCreatePrescription,
    tryUpdatePrescriptionStates: mocks.tryUpdatePrescriptionStates,
    selectOtherCoverageOption: mocks.setDidSelectOtherCoverageOption,
    orderFormData: { pharmacyId: 'test-pharmacy-id' },
    setOrderFormData: () => undefined
  };

  return (
    <MockPrescribeContext.Provider value={mockValues}>
      {props.children}
    </MockPrescribeContext.Provider>
  );
}
