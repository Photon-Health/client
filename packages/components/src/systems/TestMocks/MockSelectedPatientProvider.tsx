import { createContext, JSXElement, untrack } from 'solid-js';
import { SelectedPatientContextType } from '../SelectedPatientProvider';

export const MockSelectedPatientContext = createContext<SelectedPatientContextType>();

export const mockSelectedPatientContextValues = (): SelectedPatientContextType => {
  return {
    preferredPharmacies: () => [],
    preferredPharmacyId: () => undefined,
    recentOrder: () => undefined,
    patientPharmacyDataLoading: () => false
  };
};

interface MockSelectedPatientProviderProps {
  children: JSXElement;
  preferredPharmacyId?: string;
}

export function MockSelectedPatientProvider(props: MockSelectedPatientProviderProps) {
  const mocks = untrack(() => ({
    ...mockSelectedPatientContextValues(),
    preferredPharmacyId: () => props.preferredPharmacyId
  }));

  return (
    <MockSelectedPatientContext.Provider value={mocks}>
      {props.children}
    </MockSelectedPatientContext.Provider>
  );
}
