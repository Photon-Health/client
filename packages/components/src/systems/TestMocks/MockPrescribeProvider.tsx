import { PhotonClient } from '@photonhealth/sdk';
import { createContext, JSXElement, untrack } from 'solid-js';
import { vi } from 'vitest';
import { PrescribeContextType } from '../PrescribeProvider';

export const MockPrescribeContext = createContext<PrescribeContextType>();

export const mockPrescribeContextValues = () => {
  return {
    // mock values
    coverageOptions: () => [],
    routingConstraints: () => [],
    combinedRoutingConstraint: () => {
      return {
        prescriptions: [],
        routing_constraint_type: 'exclude',
        constraint_pharmacies: []
      };
    },
    unroutablePharmacyIds: () => new Set(),
    selectedCoverageOption: () => undefined,
    // mock actions
    selectOtherCoverageOption: vi.fn(),
    orderFormData: { pharmacyId: 'test-pharmacy-id' },
    setOrderFormData: () => undefined
  } as PrescribeContextType;
};

interface MockPrescribeProviderProps {
  client?: PhotonClient;
  children: JSXElement;
}

export function MockPrescribeProvider(props: MockPrescribeProviderProps) {
  const mocks = untrack(() => mockPrescribeContextValues());

  return (
    <MockPrescribeContext.Provider value={mocks}>{props.children}</MockPrescribeContext.Provider>
  );
}
