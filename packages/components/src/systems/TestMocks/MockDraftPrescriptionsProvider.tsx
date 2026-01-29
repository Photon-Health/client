import { createContext, JSXElement, untrack } from 'solid-js';
import { vi } from 'vitest';
import { DraftPrescriptionsContextType } from '../DraftPrescriptions';

export const MockDraftPrescriptionsContext = createContext<DraftPrescriptionsContextType>();

export const mockDraftPrescriptionsContextValues = () => {
  return {
    draftPrescriptions: () => [],
    prescriptionIds: () => [],
    isLoadingPrefills: () => false,
    deletePrescription: vi.fn(),
    tryCreatePrescription: vi.fn(),
    tryUpdatePrescriptionStates: vi.fn(),
    setDraftPrescriptions: vi.fn()
  };
};

interface MockDraftPrescriptionsProviderProps {
  children: JSXElement;
  mockValues?: ReturnType<typeof mockDraftPrescriptionsContextValues>;
}

export function MockDraftPrescriptionsProvider(props: MockDraftPrescriptionsProviderProps) {
  const mocks = untrack(() => ({ ...mockDraftPrescriptionsContextValues(), ...props.mockValues }));

  return (
    <MockDraftPrescriptionsContext.Provider value={mocks}>
      {props.children}
    </MockDraftPrescriptionsContext.Provider>
  );
}
