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
import { Catalog, Prescription, PrescriptionTemplate } from '@photonhealth/sdk/dist/types';
import {
  CreatePrescription,
  CreatePrescriptionTemplate,
  GetPrescription,
  GetTemplatesFromCatalogs
} from '../../fetch/queries';
import { FetchResult } from '@apollo/client/core';

type CreatePrescriptionResult =
  | { data: Prescription; error: null }
  | {
      data: null;
      error: { isPrescriptionAlreadyAdded: boolean };
    };

const PrescribeContext = createContext<{
  // values
  prescriptions: Accessor<Prescription[]>;
  prescriptionIds: Accessor<string[]>;
  isLoading: Accessor<boolean>;

  // actions
  setEditingPrescription: (id: string) => void;
  deletePrescription: (id: string) => void;
  createPrescription: (prescription: PrescriptionFormData) => Promise<CreatePrescriptionResult>;
  addPrescriptionToTemplates: (
    prescription: PrescriptionFormData,
    catalogId: string,
    templateName?: string,
    isPrivate?: boolean
  ) => Promise<FetchResult>;
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
  effectiveDate: string;
  treatment: {
    id: string;
  };
  dispenseAsWritten: boolean;
  dispenseQuantity: number;
  dispenseUnit: string;
  daysSupply: number;
  instructions: string;
  notes: string;
  fillsAllowed: number;
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
  // const [prescriptionIds, setPrescriptionIds] = createSignal<string[]>([]);
  const [prescriptions, setPrescriptions] = createSignal<Prescription[]>([]);
  const [isLoading, setIsLoading] = createSignal<boolean>(false);
  const [hasCreatedPrescriptions, setHasCreatedPrescriptions] = createSignal<boolean>(false);

  const client = usePhotonClient();

  const prescriptionIds = createMemo(() => prescriptions().map((prescription) => prescription.id));

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

  async function createPrescriptionsFromIds() {
    setHasCreatedPrescriptions(true);
    setIsLoading(true);
    const prescriptionsToCreate: PrescriptionFormData[] = [];

    // fetch templates
    if (props.templateIdsPrefill.length > 0) {
      let catalogs;
      try {
        const { data } = await client!.apollo.query({ query: GetTemplatesFromCatalogs });
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
            console.error(`Template is missing required prescription details ${templateId}`);
          } else {
            // if template.id is in templateOverrides, apply the overrides
            const templateOverride = props.templateOverrides?.[template.id];
            const updatedTemplate = templateOverride
              ? { ...template, ...templateOverride }
              : template;
            console.log('!!!!!!!!!!!!! updatedTemplate', updatedTemplate);
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
            const { data } = await client!.apollo.query({
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
    await Promise.all(
      prescriptionsToCreate.map(async (prescription: PrescriptionFormData) =>
        createPrescription(prescription)
      )
    );
    setIsLoading(false);
  }

  const setInitialPrescriptionsAndTemplates = () => {
    console.log('todo: setInitialPrescriptionsAndTemplates');
  };

  const createPrescription = async (
    prescription: PrescriptionFormData
  ): Promise<CreatePrescriptionResult> => {
    const isPrescriptionAlreadyAdded = isTreatmentInDraftPrescriptions(
      prescription.treatment.id,
      prescriptions()
    );

    if (isPrescriptionAlreadyAdded) {
      return { data: null, error: { isPrescriptionAlreadyAdded: true } };
    }

    try {
      console.log({ prescriptionFormData: prescription });
      const res = await client!.apollo.mutate({
        mutation: CreatePrescription,
        variables: transformPrescription(prescription, props.patientId)
      });
      const createdPrescription = res.data.createPrescription;
      console.log({ createdPrescription });
      setPrescriptions((prev) => [...prev, createdPrescription]);
      return {
        data: createdPrescription as Prescription,
        error: null
      };
    } catch (error) {
      console.error('Mutation error:', error);
      throw error;
    }
  };

  const setEditingPrescription = (toEditId: string) => {
    setPrescriptions((prev) => prev.filter((rx) => rx.id !== toEditId));
  };

  const deletePrescription = (toDeleteId: string) => {
    setPrescriptions((prev) => prev.filter((rx) => rx.id !== toDeleteId));
  };

  const addPrescriptionToTemplates = async (
    prescription: PrescriptionFormData,
    catalogId: string,
    templateName = '',
    isPrivate = true
  ) => {
    const res = await client!.apollo.mutate({
      mutation: CreatePrescriptionTemplate,
      variables: {
        ...transformPrescription(prescription, props.patientId),
        catalogId,
        isPrivate,
        ...(templateName ? { name: templateName } : {})
      }
    });
    return res;
  };

  const value = {
    // values
    prescriptionIds,
    prescriptions,
    isLoading,
    // actions
    setInitialPrescriptionsAndTemplates,
    createPrescription,
    setEditingPrescription,
    deletePrescription,
    addPrescriptionToTemplates
  };

  return <PrescribeContext.Provider value={value}>{props.children}</PrescribeContext.Provider>;
};

export const usePrescribe = () => {
  return useContext(PrescribeContext);
};

export function isTreatmentInDraftPrescriptions(
  treatmentId: string,
  draftedPrescriptions: { treatment: { id: string } }[]
) {
  return draftedPrescriptions.some((draft) => draft.treatment.id === treatmentId);
}
