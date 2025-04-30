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
import {
  Catalog,
  Prescription,
  PrescriptionState,
  PrescriptionTemplate
} from '@photonhealth/sdk/dist/types';
import {
  CreatePrescription,
  CreatePrescriptionTemplate,
  GenerateCoverageOptions,
  GetPatientPreferredPharmacies,
  GetPrescription,
  GetTemplatesFromCatalogs,
  UpdatePrescriptionStates
} from '../../fetch';
import { triggerToast, useRecentOrders } from '../../index';
import { useDraftPrescriptions } from '../DraftPrescriptions';

const PrescribeContext = createContext<{
  // values
  prescriptionIds: Accessor<string[]>;
  isLoadingPrefills: Accessor<boolean>;
  coverageOptions: Accessor<CoverageOption[]>;

  // actions
  deletePrescription: (id: string) => void;
  tryCreatePrescription: (
    prescriptionFormData: PrescriptionFormData,
    options?: TryCreatePrescriptionTemplateOptions
  ) => Promise<Prescription>;
  tryUpdatePrescriptionStates: (ids: string[], state: PrescriptionState) => Promise<boolean>;
}>();

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
  const [isLoadingPrefills, setIsLoadingPrefills] = createSignal<boolean>(false);
  const [hasCreatedPrescriptions, setHasCreatedPrescriptions] = createSignal<boolean>(false);
  const [coverageOptions, setCoverageOptions] = createSignal<CoverageOption[]>([]);
  const [patientPreferredPharmacyId, setPatientPreferredPharmacyId] = createSignal<string | null>(
    null
  );
  // const [patientBenefits, setPatientBenefits] = createSignal<Benefit[]>([]);

  const client = usePhotonClient();
  const { draftPrescriptions, setDraftPrescriptions } = useDraftPrescriptions();
  const [, recentOrdersActions] = useRecentOrders();

  const prescriptionIds = createMemo(() =>
    draftPrescriptions().map((prescription) => prescription.id)
  );

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
      getPatientPreferredPharmacies(props.patientId).then((pharmacies) => {
        if (pharmacies.length > 0) {
          setPatientPreferredPharmacyId(pharmacies[0].id);
        }
      });
    }
  });

  // if we have prescriptions, coverage check is enabled, and the patient has a preferred pharmacy,
  // then we need to check the coverage of the prescriptions
  createEffect(() => {
    const pharmacyId = patientPreferredPharmacyId();
    const prescriptions = draftPrescriptions();
    if (props.enableCoverageCheck && prescriptions.length > 0 && pharmacyId !== null) {
      generateCoverageOptions(prescriptions, pharmacyId).then((generatedCoverageOptions) => {
        setCoverageOptions(generatedCoverageOptions);
      });
    }
  });

  async function createPrescriptionsFromIds() {
    setHasCreatedPrescriptions(true);
    setIsLoadingPrefills(true);
    const prescriptionsToCreate: PrescriptionFormData[] = [];

    // fetch templates
    if (props.templateIdsPrefill.length > 0) {
      let catalogs;
      try {
        const { data } = await client.apollo.query({ query: GetTemplatesFromCatalogs });
        catalogs = data?.catalogs;
      } catch (error) {
        console.error('Error fetching templates:', error);
        return;
      }

      if (catalogs) {
        // get all templates, most likely only one catalog
        const templates = catalogs.reduce(
          (acc: PrescriptionTemplate[], catalog: Catalog) => [...acc, ...catalog.templates],
          []
        );

        // for each templateId, find the template by id and set the draft prescription
        props.templateIdsPrefill.forEach((templateId: string) => {
          const template = templates.find(
            (template: PrescriptionTemplate) => template.id === templateId
          );

          if (!template) {
            return console.error(`Invalid template id ${templateId}`);
          }

          if (
            // minimum template fields required to create a prescription
            !template?.treatment ||
            !template?.dispenseQuantity ||
            !template?.dispenseUnit ||
            !template?.fillsAllowed ||
            !template?.instructions
          ) {
            // todo: better error handling; show toast? throw error?
            console.error(`Template is missing required prescription details ${templateId}`);
          } else {
            // if template.id is in templateOverrides, apply the overrides
            const templateOverride = props.templateOverrides?.[template.id];
            const updatedTemplate = templateOverride
              ? { ...template, ...templateOverride }
              : template;
            prescriptionsToCreate.push(updatedTemplate);
          }
        });
      }
    }

    // Fetch prescriptions if needed
    if (props.prescriptionIdsPrefill.length > 0) {
      try {
        const fetchedPrescriptions = await Promise.all(
          props.prescriptionIdsPrefill.map(async (prescriptionId: string) => {
            const { data } = await client.apollo.query({
              query: GetPrescription,
              variables: { id: prescriptionId }
            });
            return data?.prescription;
          })
        );
        prescriptionsToCreate.push(...fetchedPrescriptions);
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
      }
    }

    // create prescriptions from template and prescription ids
    // todo: error handling
    await Promise.all(
      prescriptionsToCreate.map(async (prescription: PrescriptionFormData) =>
        tryCreatePrescription(prescription)
      )
    );
    setIsLoadingPrefills(false);
  }

  const getPatientPreferredPharmacies = async (patientId: string) => {
    try {
      const response = await client.apollo.query({
        query: GetPatientPreferredPharmacies,
        variables: { id: patientId }
      });
      return response.data.patient.preferredPharmacies as PatientPreferredPharmacy[];
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
    try {
      const res = await client.apolloClinical.mutate({
        mutation: GenerateCoverageOptions,
        variables: {
          pharmacyId,
          prescriptions: prescriptions.map((prescription) => ({
            id: prescription.id
            // icd10codes: ['gotta get this']
          }))
        }
      });
      return res.data.generateCoverageOptions as CoverageOption[];
    } catch (error) {
      triggerToast({
        status: 'error',
        header: 'Error Looking Up Coverage Option(s)',
        body: (error as Error).message
      });
      throw error;
    }
  };

  const tryCreatePrescription = async (
    prescriptionFormData: PrescriptionFormData,
    options: TryCreatePrescriptionTemplateOptions = {}
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
      // todo: can we pass the promise down instead of reject/resolve callbacks?
      let resolver: (result: Prescription) => void;
      let rejecter: () => void;
      const promise = new Promise<Prescription>((resolve, reject) => {
        resolver = resolve;
        rejecter = reject;
      });
      recentOrdersActions.setIsDuplicateDialogOpen(
        true,
        duplicateFill,
        async () => {
          const result = await createPrescriptionOnApi(prescriptionFormData, options);
          resolver(result);
        },
        () => rejecter()
      );
      return promise;
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
    options: TryCreatePrescriptionTemplateOptions = { addToTemplates: false }
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

      triggerToast({
        status: 'success',
        header: 'Personal Template Saved'
      });
    }

    triggerToast({
      status: 'success',
      header: 'Prescription Added',
      body: 'You can send this order or add another prescription before sending it'
    });

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

  const value = {
    // values
    prescriptionIds,
    isLoadingPrefills,
    coverageOptions,
    // actions
    tryCreatePrescription,
    tryUpdatePrescriptionStates,
    deletePrescription
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
  status: string | 'COVERED' | 'COVERED_WITH_RESTRICTIONS';
  statusMessage: string;
  treatment: { id: string; name: string };
  alerts: Array<{ label: string; text: string }>;
};

// export type Benefit = {
//   id: string;
//   bin: string;
//   groupId: string;
//   memberId: string;
//   pcn: string;
// };
