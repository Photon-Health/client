import { createContext, createSignal, JSXElement, untrack } from 'solid-js';
import { PharmacySelectionContextType } from '../PharmacySelectionProvider';

export const MockPharmacySelectionContext = createContext<PharmacySelectionContextType>();

export const mockPharmacySelectionContextValues = (): PharmacySelectionContextType => {
  const [pharmacyId, setPharmacyId] = createSignal<string | undefined>('test-pharmacy-id');
  const [fulfillmentType, setFulfillmentType] = createSignal<any>(undefined);
  const [updatePreferredPharmacy, setUpdatePreferredPharmacy] = createSignal(false);

  return {
    pharmacyId,
    fulfillmentType,
    updatePreferredPharmacy,
    autoRoutedPharmacyId: () => undefined,
    isAutoRouted: () => false,
    setPharmacyId,
    setFulfillmentType,
    setUpdatePreferredPharmacy
  };
};

interface MockPharmacySelectionProviderProps {
  children: JSXElement;
}

export function MockPharmacySelectionProvider(props: MockPharmacySelectionProviderProps) {
  const mocks = untrack(() => mockPharmacySelectionContextValues());

  return (
    <MockPharmacySelectionContext.Provider value={mocks}>
      {props.children}
    </MockPharmacySelectionContext.Provider>
  );
}
