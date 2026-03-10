import {
  Accessor,
  createContext,
  createEffect,
  createSignal,
  JSXElement,
  useContext
} from 'solid-js';
import { usePhotonClient } from '../SDKProvider';
import { Prescription } from '@photonhealth/sdk/dist/types';
import { GenerateCoverageOptions, GetPatientPreferredPharmaciesAndAddress } from '../../fetch';
import { triggerToast } from '../../index';
import { useDraftPrescriptions } from '../DraftPrescriptions';
import { usePharmacySelectionContext, Address } from '../PharmacySelect/PharmacySelectionProvider';
import { Env } from '@photonhealth/sdk';

export type PrescribeContextType = {
  // values
  coverageOptions: Accessor<CoverageOption[]>;
  selectedCoverageOption: Accessor<CoverageOption | undefined>;

  // actions
  selectOtherCoverageOption: (value: CoverageOption) => void;
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

export const PrescribeProvider = (props: PrescribeProviderProps) => {
  const { draftPrescriptions, setDraftPrescriptions } = useDraftPrescriptions();
  const pharmacySelectionContext = usePharmacySelectionContext();
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
          pharmacySelectionContext.fetchLocalPharmacies(address).then((pharmacies) => {
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

  // Coordinator: when a coverage option is selected, sync pharmacyId to the pharmacy provider
  const selectOtherCoverageOption = (value: CoverageOption) => {
    setSelectedCoverageOption(value);
    setDidSelectOtherCoverageOption(true);
    pharmacySelectionContext.setPharmacyId(value.pharmacy.id);
  };

  const value = {
    // values
    coverageOptions,
    selectedCoverageOption,

    // actions
    selectOtherCoverageOption
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
