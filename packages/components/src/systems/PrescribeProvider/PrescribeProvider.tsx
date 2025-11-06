import {
  Accessor,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  JSXElement,
  useContext
} from 'solid-js';
import { format } from 'date-fns';
import { usePhotonClient } from '../SDKProvider';
import { Prescription, PrescriptionState } from '@photonhealth/sdk/dist/types';
import {
  CreatePrescription,
  CreatePrescriptions,
  CreatePrescriptionTemplate,
  GenerateCoverageOptions,
  GetPatientPreferredPharmaciesAndAddress,
  GetPharmaciesQuery,
  GetPrescription,
  UpdatePrescriptionStates
} from '../../fetch';
import { triggerToast, useRecentOrders } from '../../index';
import { useDraftPrescriptions } from '../DraftPrescriptions';
import {
  combineAllRoutingConstraints,
  getRoutingConstraint,
  RoutingConstraint
} from '../RoutingConstraints';
import { createStore } from 'solid-js/store';
import getLocation from '../../utils/getLocations';
import { useGoogleService } from '../GoogleServiceProvider';
// The order form data will consist of, at least, the list of selected prescription IDs and pharmacy ID.
// The prescription form data (todo) will consist of a single prescription's data during user input
// Note: Multiple prescription "sub" forms can be opened/completed within a single order form
interface PrescribeOrderFormData {
  pharmacyId?: string;
}

export type PrescribeContextType = {
  // values
  prescriptionIds: Accessor<string[]>;
  isLoadingPrefills: Accessor<boolean>;
  coverageOptions: Accessor<CoverageOption[]>;
  routingConstraints: Accessor<RoutingConstraint[]>;
  combinedRoutingConstraint: Accessor<RoutingConstraint>;
  unroutablePharmacyIds: Accessor<Set<string>>;
  orderFormData: PrescribeOrderFormData;
  selectedCoverageOption: Accessor<CoverageOption | undefined>;

  // actions
  deletePrescription: (id: string) => void;
  tryCreatePrescription: (
    prescriptionFormData: PrescriptionFormData,
    options?: TryCreatePrescriptionTemplateOptions
  ) => Promise<Prescription>;
  tryUpdatePrescriptionStates: (ids: string[], state: PrescriptionState) => Promise<boolean>;
  selectOtherCoverageOption: (value: CoverageOption) => void;
  setOrderFormData: <K extends keyof PrescribeOrderFormData>(
    key: K,
    value: PrescribeOrderFormData[K]
  ) => void;
};

const PrescribeContext = createContext<PrescribeContextType>();

export type TemplateOverrides = {
  [key: string]: {
    daysSupply?: number;
    dispenseAsWritten?: boolean;
    dispenseQuantity?: number;
    dispenseUnit?: string;
    fillsAllowed?: number;
    instructions?: string;
    notes?: string;
    externalId?: string;
  };
};

export type PrescriptionFormData = {
  id?: string;
  effectiveDate: string;
  treatment: {
    id: string;
    name: string;
  };
  dispenseAsWritten: boolean;
  dispenseQuantity?: number;
  dispenseUnit?: string;
  daysSupply?: number;
  instructions: string;
  notes: string;
  fillsAllowed?: number;
  catalogId?: string;
  externalId?: string;
  diagnoseCodes: string[];
};

interface PrescribeProviderProps {
  children: JSXElement;
  templateIdsPrefill: string[];
  templateOverrides: TemplateOverrides;
  prescriptionIdsPrefill: string[];
  patientId: string;
  enableCombineAndDuplicate: boolean;
  enableCoverageCheck: boolean;
}

const transformPrescription = (prescription: PrescriptionFormData, patientId: string) => ({
  externalId: prescription.externalId,
  patientId: patientId,
  treatmentId: prescription.treatment?.id,
  dispenseAsWritten: prescription.dispenseAsWritten,
  dispenseQuantity: prescription.dispenseQuantity,
  dispenseUnit: prescription.dispenseUnit,
  fillsAllowed: prescription.fillsAllowed,
  daysSupply: prescription.daysSupply,
  instructions: prescription.instructions,
  notes: prescription.notes,
  effectiveDate: format(new Date(), 'yyyy-MM-dd').toString(),
  diagnoses: prescription.diagnoseCodes
});

export const PrescribeProvider = (props: PrescribeProviderProps) => {
  const { googleMapsServices } = useGoogleService();
  const [isLoadingPrefills, setIsLoadingPrefills] = createSignal<boolean>(false);
  const [hasCreatedPrescriptions, setHasCreatedPrescriptions] = createSignal<boolean>(false);
  const [coverageOptions, setCoverageOptions] = createSignal<CoverageOption[]>([]);
  const [patientPreferredPharmacyId, setPatientPreferredPharmacyId] = createSignal<string | null>(
    null
  );
  const [patientAddress, setPatientAddress] = createSignal<Address | null>(null);
  const [didSelectOtherCoverageOption, setDidSelectOtherCoverageOption] =
    createSignal<boolean>(false);
  const [selectedCoverageOption, setSelectedCoverageOption] = createSignal<
    CoverageOption | undefined
  >();

  const [orderFormData, setOrderFormData] = createStore<PrescribeOrderFormData>();

  const client = usePhotonClient();
  const { draftPrescriptions, setDraftPrescriptions } = useDraftPrescriptions();
  const [, recentOrdersActions] = useRecentOrders();

  const prescriptionIds = createMemo(() =>
    draftPrescriptions().map((prescription) => prescription.id)
  );

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

  // Prefill new prescriptions based on templateIds or prescriptionIds when we get a patientId
  createEffect(() => {
    if (
      // must have templateIds or prescriptionIds to create prescriptions
      (props.templateIdsPrefill.length > 0 || props.prescriptionIdsPrefill.length > 0) &&
      // must have a patientId
      !!props.patientId &&
      // must not have created prescriptions yet
      !hasCreatedPrescriptions()
    ) {
      createPrescriptionsFromIds();
    }
  });

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
    // reset state on patient change
    if (props.patientId) {
      setDraftPrescriptions([]);
      setSelectedCoverageOption(undefined);
      setDidSelectOtherCoverageOption(false);
      setCoverageOptions([]);
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
      prescriptions.length > 0
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

  async function createPrescriptionsFromIds() {
    setHasCreatedPrescriptions(true);
    setIsLoadingPrefills(true);

    try {
      // Create prescriptions from template ids with a few optional override values
      if (props.templateIdsPrefill.length > 0) {
        const dedupedTemplateIds = Array.from(new Set(props.templateIdsPrefill));
        const templatedCreateRxList = dedupedTemplateIds.map((templateId) => ({
          ...props.templateOverrides?.[templateId],
          patientId: props.patientId,
          templateId
        }));

        const res = await client.apollo.mutate({
          mutation: CreatePrescriptions,
          variables: { prescriptions: templatedCreateRxList }
        });
        const newRxs = res.data.createPrescriptions as Prescription[];
        setDraftPrescriptions((prev) => [...prev, ...newRxs]);
      }

      // Fetch prescriptions if needed
      if (props.prescriptionIdsPrefill.length > 0) {
        const fetchedPrescriptions = await Promise.all(
          props.prescriptionIdsPrefill.map(async (prescriptionId: string) => {
            const { data } = await client.apollo.query({
              query: GetPrescription,
              variables: { id: prescriptionId }
            });
            return data?.prescription;
          })
        );

        // create prescriptions from template and prescription ids
        // todo: error handling
        await Promise.all(
          fetchedPrescriptions.map(async (prescription: PrescriptionFormData) =>
            tryCreatePrescription(prescription, { showSuccessToast: false })
          )
        );
      }
    } catch (error) {
      console.error('Error while trying to create prescriptions from prefill IDs', { error });
    } finally {
      setIsLoadingPrefills(false);
    }
  }

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

  const tryCreatePrescription = async (
    prescriptionFormData: PrescriptionFormData,
    options: TryCreatePrescriptionTemplateOptions = { showSuccessToast: true }
  ): Promise<Prescription> => {
    const isPrescriptionAlreadyAdded = isTreatmentInDraftPrescriptions(
      prescriptionFormData.treatment.id,
      draftPrescriptions()
    );

    if (isPrescriptionAlreadyAdded) {
      triggerToast({
        status: 'error',
        body: 'You already have this prescription in your order. You can modify the prescription or delete it in Pending Order.'
      });

      throw new Error('Prescription already added');
    }

    const duplicateFill = recentOrdersActions.checkDuplicateFill(
      prescriptionFormData.treatment.name
    );

    if (props.enableCombineAndDuplicate && duplicateFill) {
      // if there's a duplicate order, check first if they want to report an issue
      await new Promise<void>((resolve, reject) => {
        recentOrdersActions.setIsDuplicateDialogOpen(true, duplicateFill, resolve, reject);
      });
    }

    return await createPrescriptionOnApi(prescriptionFormData, options);
  };

  const tryUpdatePrescriptionStates = async (
    ids: string[],
    state: PrescriptionState
  ): Promise<boolean> => {
    try {
      const res = await client.apolloClinical.mutate({
        mutation: UpdatePrescriptionStates,
        variables: {
          input: {
            ids,
            state
          }
        }
      });

      return res.data.updatePrescriptionStates as boolean;
    } catch (error) {
      console.error('Mutation error:', error);
      triggerToast({
        status: 'error',
        header: 'Error Saving Prescription(s)',
        body: (error as Error).message
      });
      throw error;
    }
  };

  const createPrescriptionOnApi = async (
    prescriptionFormData: PrescriptionFormData,
    options: TryCreatePrescriptionTemplateOptions = {
      addToTemplates: false,
      showSuccessToast: true
    }
  ): Promise<Prescription> => {
    let createdPrescription: Prescription | null = null;
    try {
      const res = await client.apollo.mutate({
        mutation: CreatePrescription,
        variables: transformPrescription(prescriptionFormData, props.patientId)
      });
      const created = res.data.createPrescription as Prescription;
      createdPrescription = created;
      setDraftPrescriptions((prev) => [...prev, created]);
    } catch (error) {
      console.error('Mutation error:', error);
      triggerToast({
        status: 'error',
        header: 'Error Adding Prescription',
        body: 'There was an issue adding the prescription. Please try again.'
      });
      throw error;
    }

    if (options?.addToTemplates && options?.catalogId != null) {
      await createPrescriptionTemplateOnApi(
        prescriptionFormData,
        options.catalogId,
        options.templateName
      );

      if (options.showSuccessToast) {
        triggerToast({
          status: 'success',
          header: 'Personal Template Saved'
        });
      }
    }

    if (options.showSuccessToast) {
      triggerToast({
        status: 'success',
        header: 'Prescription Added',
        body: 'You can send this order or add another prescription before sending it'
      });
    }

    return createdPrescription;
  };

  const deletePrescription = (toDeleteId: string) => {
    setDraftPrescriptions((prev) => prev.filter((rx) => rx.id !== toDeleteId));
  };

  const createPrescriptionTemplateOnApi = async (
    prescription: PrescriptionFormData,
    catalogId: string,
    templateName = ''
  ) => {
    const res = await client.apollo.mutate({
      mutation: CreatePrescriptionTemplate,
      variables: {
        ...transformPrescription(prescription, props.patientId),
        catalogId,
        isPrivate: true,
        ...(templateName ? { name: templateName } : {})
      }
    });
    return res;
  };

  const selectOtherCoverageOption = (value: CoverageOption) => {
    setOrderFormData('pharmacyId', value.pharmacy.id);
    setSelectedCoverageOption(value);
    setDidSelectOtherCoverageOption(true);
  };

  const value = {
    // values
    prescriptionIds,
    isLoadingPrefills,
    coverageOptions,
    routingConstraints,
    combinedRoutingConstraint,
    unroutablePharmacyIds,
    orderFormData,
    selectedCoverageOption,

    // actions
    tryCreatePrescription,
    tryUpdatePrescriptionStates,
    deletePrescription,
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

export const usePrescribeOptional = () => {
  return useContext(PrescribeContext);
};

export function isTreatmentInDraftPrescriptions(
  treatmentId: string,
  draftedPrescriptions: { treatment: { id: string } }[]
) {
  return draftedPrescriptions.some((draft) => draft.treatment.id === treatmentId);
}

export type TryCreatePrescriptionTemplateOptions = {
  addToTemplates?: boolean;
  templateName?: string;
  catalogId?: string;
  showSuccessToast?: boolean;
};

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
