import {
  Accessor,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  JSXElement,
  useContext
} from 'solid-js';
import { types } from '@photonhealth/sdk';
import { usePrescribe } from '../PrescribeProvider';

export interface PharmacySelectionContextType {
  // Readable state
  pharmacyId: Accessor<string | undefined>;
  fulfillmentType: Accessor<types.FulfillmentType | undefined>;
  updatePreferredPharmacy: Accessor<boolean>;
  autoRoutedPharmacyId: Accessor<string | undefined>;
  isAutoRouted: Accessor<boolean>;

  // Config
  enableLocalPickup: Accessor<boolean>;
  enableSendToPatient: Accessor<boolean>;
  enableDeliveryPharmacies: Accessor<boolean>;
  mailOrderPharmacyIds: Accessor<string[] | undefined>;

  // Actions
  setPharmacyId: (id: string | undefined) => void;
  setFulfillmentType: (type: types.FulfillmentType | undefined) => void;
  setUpdatePreferredPharmacy: (shouldSet: boolean) => void;
}

const PharmacySelectionContext = createContext<PharmacySelectionContextType>();

interface PharmacySelectionProviderProps {
  children: JSXElement;
  pharmacyIdProp?: string;
  enableLocalPickup?: boolean;
  enableSendToPatient?: boolean;
  enableDeliveryPharmacies?: boolean;
  mailOrderIds?: string;
  onFulfillmentTypeChange?: (type: types.FulfillmentType | undefined) => void;
  onPreferredPharmacyChange?: (shouldSet: boolean) => void;
}

export const PharmacySelectionProvider = (props: PharmacySelectionProviderProps) => {
  const { combinedRoutingConstraint, selectedCoverageOption } = usePrescribe();

  const [pharmacyId, setPharmacyId] = createSignal<string | undefined>();
  const [fulfillmentType, setFulfillmentType] = createSignal<types.FulfillmentType | undefined>();
  const [updatePreferredPharmacy, setUpdatePreferredPharmacy] = createSignal(false);

  const autoRoutedPharmacyId = createMemo(() => {
    if (props.pharmacyIdProp) {
      return props.pharmacyIdProp;
    }

    if (
      combinedRoutingConstraint()?.routing_constraint_type === 'include' &&
      combinedRoutingConstraint()?.constraint_pharmacies?.length === 1
    ) {
      return combinedRoutingConstraint().constraint_pharmacies?.[0].id;
    }
  });

  const isAutoRouted = createMemo(() => Boolean(autoRoutedPharmacyId()));

  const enableLocalPickup = createMemo(
    () => props.enableLocalPickup || (!props.enableSendToPatient && !props.mailOrderIds)
  );
  const enableSendToPatient = createMemo(() => props.enableSendToPatient ?? false);
  const enableDeliveryPharmacies = createMemo(() => props.enableDeliveryPharmacies ?? false);
  const mailOrderPharmacyIds = createMemo(() =>
    props.mailOrderIds ? props.mailOrderIds.split(',') : undefined
  );

  // Sync coverage option selection to pharmacyId
  createEffect(() => {
    const coverageOption = selectedCoverageOption();
    if (coverageOption) {
      setPharmacyId(coverageOption.pharmacy.id);
    }
  });

  // Notify parent when fulfillment type or preferred pharmacy changes
  createEffect(() => {
    props.onFulfillmentTypeChange?.(fulfillmentType());
  });

  createEffect(() => {
    props.onPreferredPharmacyChange?.(updatePreferredPharmacy());
  });

  const value: PharmacySelectionContextType = {
    pharmacyId,
    fulfillmentType,
    updatePreferredPharmacy,
    autoRoutedPharmacyId,
    isAutoRouted,

    enableLocalPickup,
    enableSendToPatient,
    enableDeliveryPharmacies,
    mailOrderPharmacyIds,

    setPharmacyId,
    setFulfillmentType,
    setUpdatePreferredPharmacy
  };

  return (
    <PharmacySelectionContext.Provider value={value}>
      {props.children}
    </PharmacySelectionContext.Provider>
  );
};

export const usePharmacySelectionContext = () => {
  const context = useContext(PharmacySelectionContext);
  if (!context) {
    throw new Error('usePharmacySelection must be used within PharmacySelectionProvider');
  }
  return context;
};
