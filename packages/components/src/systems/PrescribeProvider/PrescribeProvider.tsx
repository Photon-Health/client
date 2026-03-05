import {
  Accessor,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  JSXElement,
  useContext
} from 'solid-js';
import { usePhotonClient } from '../SDKProvider';
import { Prescription } from '@photonhealth/sdk/dist/types';
import {
  GenerateCoverageOptions,
  GetPatientPreferredPharmaciesAndAddress,
  GetPharmaciesQuery
} from '../../fetch';
import { triggerToast } from '../../index';
import { useDraftPrescriptions } from '../DraftPrescriptions';
import {
  combineAllRoutingConstraints,
  getRoutingConstraint,
  RoutingConstraint
} from '../RoutingConstraints';
import { createStore } from 'solid-js/store';
import getLocation from '../../utils/getLocations';
import { useGoogleService } from '../GoogleServiceProvider';
import { Env } from '@photonhealth/sdk';

// The order form data will consist of, at least, the list of selected prescription IDs and pharmacy ID.
// The prescription form data (todo) will consist of a single prescription's data during user input
// Note: Multiple prescription "sub" forms can be opened/completed within a single order form
interface PrescribeOrderFormData {
  pharmacyId?: string;
}

export type PrescribeContextType = {
  // values
  coverageOptions: Accessor<CoverageOption[]>;
  routingConstraints: Accessor<RoutingConstraint[]>;
  combinedRoutingConstraint: Accessor<RoutingConstraint>;
  unroutablePharmacyIds: Accessor<Set<string>>;
  orderFormData: PrescribeOrderFormData;
  selectedCoverageOption: Accessor<CoverageOption | undefined>;

  // actions
  selectOtherCoverageOption: (value: CoverageOption) => void;
  setOrderFormData: <K extends keyof PrescribeOrderFormData>(
    key: K,
    value: PrescribeOrderFormData[K]
  ) => void;
};

const PrescribeContext = createContext<PrescribeContextType>();

interface PrescribeProviderProps {
  children: JSXElement;
  patientId: string;
  enableCoverageCheck: boolean;
}

export type PatientPreferredPharmacy = {
  id: string;
  name: string;
};

export type CoverageOption = {
  daysSupply: number;
  dispenseQuantity: number;
  dispenseUnit: string;
  id: string;
  isAlternative: boolean;
  paRequired: boolean;
  prescriptionId: string;
  price: number | null;
  status: 'COVERED' | 'COVERED_WITH_RESTRICTIONS' | 'NOT_COVERED';
  statusMessage: string;
  treatment: { id: string; name: string };
  alerts: Array<{ label: string; text: string }>;
  pharmacy: { id: string; name: string };
};

export type Address = {
  street1: string;
  street2: string;
  city: string;
  state: string;
  postalCode: string;
};

export const PrescribeProvider = (props: PrescribeProviderProps) => {
  const { googleMapsServices } = useGoogleService();
  const { draftPrescriptions, setDraftPrescriptions } = useDraftPrescriptions();
  const client = usePhotonClient();
  const [coverageOptions, setCoverageOptions] = createSignal<CoverageOption[]>([]);
  const [patientPreferredPharmacyId, setPatientPreferredPharmacyId] = createSignal<string | null>(
    null
  );
  const [lastPatientId, setLastPatientId] = createSignal<string | null>(null);
  const [patientAddress, setPatientAddress] = createSignal<Address | null>(null);
  const [didSelectOtherCoverageOption, setDidSelectOtherCoverageOption] =
    createSignal<boolean>(false);
  const [selectedCoverageOption, setSelectedCoverageOption] = createSignal<
    CoverageOption | undefined
  >();

  const [orderFormData, setOrderFormData] = createStore<PrescribeOrderFormData>();

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

  createEffect(() => {
    if (props.patientId) {
      getPatientPreferredPharmaciesAndAddress(props.patientId).then(({ pharmacies, address }) => {
        if (pharmacies.length > 0) {
          setPatientPreferredPharmacyId(pharmacies[0].id);
        }
        if (address) {
          setPatientAddress(address);
        }
      });
    }
  });

  createEffect(() => {
    // reset state only when the patient id changes or is cleared
    if (props.patientId && props.patientId !== lastPatientId()) {
      setDraftPrescriptions([]);
      setSelectedCoverageOption(undefined);
      setDidSelectOtherCoverageOption(false);
      setCoverageOptions([]);
      setLastPatientId(props.patientId);
    } else if (!props.patientId && lastPatientId() !== null) {
      setDraftPrescriptions([]);
      setSelectedCoverageOption(undefined);
      setDidSelectOtherCoverageOption(false);
      setCoverageOptions([]);
      setLastPatientId(null);
    }
  });

  // if we have prescriptions, coverage check is enabled, and the patient has a preferred pharmacy,
  // then we need to check the coverage of the prescriptions on the preferred pharmacy
  // -- IF the patient does NOT have a preferred pharmacy, then we need to check the coverage
  // based on pharmacy near the patient
  createEffect(() => {
    const preferredId = patientPreferredPharmacyId();
    const prescriptions = draftPrescriptions();

    if (
      !didSelectOtherCoverageOption() && // after an alternate is chosen, stop fetching coverages for this patient
      props.enableCoverageCheck &&
      prescriptions.length > 0 &&
      // This doesn't work while we can't run lambdas locally
      // bc prescriptions are created in boson while generateCoverageOptions happens in tau
      (import.meta.env.VITE_ENV_NAME as Env) !== 'tau'
    ) {
      if (preferredId) {
        // check coverage on the preferred pharmacy
        generateCoverageOptions(prescriptions, preferredId).then((generatedCoverageOptions) => {
          setCoverageOptions(generatedCoverageOptions);
        });
      } else {
        // check coverage on a walgreens or cvs pharmacy near the patient
        const address = patientAddress();
        if (address) {
          fetchLocalPharmacies(address).then((pharmacies) => {
            let localPharmacyId: string | null = null;
            const majorChainPharmacy = pharmacies.find(
              (pharmacy: { id: string; name: string }) =>
                pharmacy.name.toLowerCase().includes('cvs') ||
                pharmacy.name.toLowerCase().includes('walgreens') ||
                pharmacy.name.toLowerCase().includes('walmart') ||
                pharmacy.name.toLowerCase().includes('rite aid')
            );

            // if we found a major chain pharmacy, use that otherwise use the first pharmacy in the list
            localPharmacyId = majorChainPharmacy?.id || pharmacies[0]?.id;

            if (localPharmacyId) {
              generateCoverageOptions(prescriptions, localPharmacyId).then(
                (generatedCoverageOptions) => {
                  setCoverageOptions(generatedCoverageOptions);
                }
              );
            }
          });
        }
      }
    }
  });

  const getPatientPreferredPharmaciesAndAddress = async (patientId: string) => {
    try {
      const response = await client.apollo.query({
        query: GetPatientPreferredPharmaciesAndAddress,
        variables: { id: patientId }
      });

      return {
        pharmacies: response.data.patient.preferredPharmacies as PatientPreferredPharmacy[],
        address: response.data.patient.address as Address
      };
    } catch (error) {
      triggerToast({
        status: 'error',
        header: 'Error Looking Up Patient Pharmacy',
        body: (error as Error).message
      });
      throw error;
    }
  };

  const generateCoverageOptions = async (
    prescriptions: Prescription[],
    pharmacyId: string
  ): Promise<CoverageOption[]> => {
    const response = await client.apolloClinical.mutate({
      mutation: GenerateCoverageOptions,
      variables: {
        pharmacyId,
        prescriptions: prescriptions.map((prescription) => ({
          id: prescription.id
          // icd10codes: ['gotta get this']
        }))
      }
    });
    return response.data.generateCoverageOptions as CoverageOption[];
  };

  const selectOtherCoverageOption = (value: CoverageOption) => {
    setOrderFormData('pharmacyId', value.pharmacy.id);
    setSelectedCoverageOption(value);
    setDidSelectOtherCoverageOption(true);
  };

  const value = {
    // values
    coverageOptions,
    routingConstraints,
    combinedRoutingConstraint,
    unroutablePharmacyIds,
    orderFormData,
    selectedCoverageOption,

    // actions
    selectOtherCoverageOption,
    setOrderFormData
  };

  return <PrescribeContext.Provider value={value}>{props.children}</PrescribeContext.Provider>;
};

export const usePrescribe = () => {
  const context = useContext(PrescribeContext);
  if (!context) {
    throw new Error('usePrescribe must be used within the PrescribeProvider');
  }
  return context;
};
