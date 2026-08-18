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
import { Prescription } from '@photonhealth/sdk/dist/types';
import { usePhotonClient } from '../SDKProvider';
import { GetPharmaciesQuery } from '../../fetch';
import { useGoogleService } from '../GoogleServiceProvider';
import getLocation from '../../utils/getLocations';
import { useDraftPrescriptions } from '../DraftPrescriptions';
import {
  combineAllRoutingConstraints,
  getRoutingConstraint,
  RoutingConstraint
} from '../RoutingConstraints';

export type Address = {
  street1: string;
  street2: string;
  city: string;
  state: string;
  postalCode: string;
};

export interface PharmacySelectionContextType {
  // Readable state
  pharmacyId: Accessor<string | undefined>;
  fulfillmentType: Accessor<types.FulfillmentType | undefined>;
  updatePreferredPharmacy: Accessor<boolean>;
  autoRoutedPharmacyId: Accessor<string | undefined>;

  // Routing
  routingConstraints: Accessor<RoutingConstraint[]>;
  combinedRoutingConstraint: Accessor<RoutingConstraint>;
  unroutablePharmacyIds: Accessor<Set<string>>;

  // Config
  enableLocalPickup: Accessor<boolean>;
  enableSendToPatient: Accessor<boolean>;
  enableDeliveryPharmacies: Accessor<boolean>;
  mailOrderPharmacyIds: Accessor<string[] | undefined>;

  // Actions
  setPharmacyId: (id: string | undefined) => void;
  setFulfillmentType: (type: types.FulfillmentType | undefined) => void;
  setUpdatePreferredPharmacy: (shouldSet: boolean) => void;
  fetchLocalPharmacies: (address: Address) => Promise<{ id: string; name: string }[]>;
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
  const { draftPrescriptions } = useDraftPrescriptions();
  const { googleMapsServices } = useGoogleService();
  const client = usePhotonClient();

  const [pharmacyId, setPharmacyId] = createSignal<string | undefined>();
  const [fulfillmentType, setFulfillmentType] = createSignal<types.FulfillmentType | undefined>();
  const [updatePreferredPharmacy, setUpdatePreferredPharmacy] = createSignal(false);

  // Routing constraints derived from draft prescriptions
  const routingConstraints = createMemo((): RoutingConstraint[] => {
    return draftPrescriptions().map((prescription: Prescription) =>
      getRoutingConstraint(prescription)
    );
  });

  const combinedRoutingConstraint = createMemo(() => {
    return combineAllRoutingConstraints(routingConstraints());
  });

  const unroutablePharmacyIds = createMemo(() => {
    const combinedExcludeRoutingConstraint = combineAllRoutingConstraints(routingConstraints(), [
      'exclude'
    ]);
    return new Set(
      combinedExcludeRoutingConstraint.constraint_pharmacies?.map((pharmacy) => pharmacy.id) || []
    );
  });

  async function fetchPharmacies(location: { latitude: number; longitude: number }) {
    const { data } = await client!.apollo.query({
      query: GetPharmaciesQuery,
      variables: {
        location: { latitude: location?.latitude, longitude: location?.longitude }
      }
    });
    if (!data?.pharmacies) {
      return [];
    }
    return data.pharmacies;
  }

  async function fetchLocalPharmacies(address: Address) {
    const { geocoder } = googleMapsServices();
    if (!geocoder) throw new Error('Geocoder not loaded');

    const stringAddress = `${address?.street1}, ${address?.city}, ${address?.state} ${address?.postalCode}`;
    const locations = await getLocation(stringAddress, geocoder);
    const pharmacies = await fetchPharmacies(locations[0]);
    return pharmacies;
  }

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

  const enableLocalPickup = createMemo(
    () => props.enableLocalPickup || (!props.enableSendToPatient && !props.mailOrderIds)
  );
  const enableSendToPatient = createMemo(() => props.enableSendToPatient ?? false);
  const enableDeliveryPharmacies = createMemo(() => props.enableDeliveryPharmacies ?? false);
  const mailOrderPharmacyIds = createMemo(() =>
    props.mailOrderIds ? props.mailOrderIds.split(',') : undefined
  );

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

    routingConstraints,
    combinedRoutingConstraint,
    unroutablePharmacyIds,

    enableLocalPickup,
    enableSendToPatient,
    enableDeliveryPharmacies,
    mailOrderPharmacyIds,

    setPharmacyId,
    setFulfillmentType,
    setUpdatePreferredPharmacy,
    fetchLocalPharmacies
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
