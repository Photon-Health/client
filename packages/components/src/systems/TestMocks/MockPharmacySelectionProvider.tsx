import { createContext, createSignal, JSXElement, untrack } from 'solid-js';
import { PharmacySelectionContextType } from '../PharmacySelect';

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
    routingConstraints: () => [],
    combinedRoutingConstraint: () => ({
      prescriptions: [],
      routing_constraint_type: 'exclude' as const,
      constraint_pharmacies: []
    }),
    unroutablePharmacyIds: () => new Set<string>(),
    enableLocalPickup: () => true,
    enableSendToPatient: () => true,
    enableDeliveryPharmacies: () => true,
    mailOrderPharmacyIds: () => undefined,
    setPharmacyId,
    setFulfillmentType,
    setUpdatePreferredPharmacy,
    fetchLocalPharmacies: async () => []
  };
};

interface MockPharmacySelectionProviderProps {
  children: JSXElement;
  enableLocalPickup?: boolean;
  enableSendToPatient?: boolean;
  enableDeliveryPharmacies?: boolean;
  mailOrderPharmacyIds?: string[];
}

export function MockPharmacySelectionProvider(props: MockPharmacySelectionProviderProps) {
  const mocks = untrack(() => ({
    ...mockPharmacySelectionContextValues(),
    enableLocalPickup: () => props.enableLocalPickup ?? true,
    enableSendToPatient: () => props.enableSendToPatient ?? true,
    enableDeliveryPharmacies: () => props.enableDeliveryPharmacies ?? true,
    mailOrderPharmacyIds: () => props.mailOrderPharmacyIds
  }));

  return (
    <MockPharmacySelectionContext.Provider value={mocks}>
      {props.children}
    </MockPharmacySelectionContext.Provider>
  );
}
