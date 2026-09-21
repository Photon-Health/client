import { createContext, JSXElement, untrack } from 'solid-js';
import { vi, type Mock } from 'vitest';
import { DraftPrescriptionsContextType } from '../DraftPrescriptions';

export const MockDraftPrescriptionsContext = createContext<DraftPrescriptionsContextType>();

interface MockDraftPrescriptionsContextValues extends DraftPrescriptionsContextType {
  deletePrescription: Mock;
  tryCreatePrescription: Mock;
  tryUpdatePrescriptionStates: Mock;
  setDraftPrescriptions: Mock;
}

export const mockDraftPrescriptionsContextValues = (): MockDraftPrescriptionsContextValues => {
  return {
    draftPrescriptions: () => [],
    prescriptionIds: () => [],
    isLoadingPrefills: () => false,
    rxNotesPrefill: () => '',
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
