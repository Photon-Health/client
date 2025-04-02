import {
  createContext,
  createEffect,
  createSignal,
  JSXElement,
  useContext,
  Accessor
} from 'solid-js';
import { format } from 'date-fns';
import { usePhotonClient } from '../SDKProvider';
import { Catalog, Prescription } from '@photonhealth/sdk/dist/types';
import { PrescriptionTemplate } from '@photonhealth/sdk/dist/types';
import gql from 'graphql-tag';
import { GetPrescription } from '../../fetch/queries';

const PrescribeContext = createContext<{
  prescriptionIds: Accessor<string[]>;
  isLoading: Accessor<boolean>;
  setPrescriptionIds: (ids: string[]) => void;
  createPrescription: (prescription: Prescription) => Promise<void>;
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

// TODO fetch individual template, to get a template currently you need to fetch catalogs and parse out the templates
// https://www.notion.so/photons/Ability-to-Query-Individual-Template-75c2277db7f44d02bc7ffdd5ab44f17c
const GetTemplatesFromCatalogs = gql`
  query TemplatesFromCatalogs {
    catalogs {
      templates {
        id
        daysSupply
        dispenseAsWritten
        dispenseQuantity
        dispenseUnit
        instructions
        notes
        fillsAllowed
        treatment {
          id
          name
        }
      }
    }
  }
`;

const CreatePrescription = gql`
  mutation CreatePrescription(
    $externalId: ID
    $patientId: ID!
    $treatmentId: ID!
    $dispenseAsWritten: Boolean
    $dispenseQuantity: Float!
    $dispenseUnit: String!
    $refillsAllowed: Int
    $fillsAllowed: Int
    $daysSupply: Int
    $instructions: String!
    $notes: String
    $effectiveDate: AWSDate
    $diagnoses: [ID]
  ) {
    createPrescription(
      externalId: $externalId
      patientId: $patientId
      treatmentId: $treatmentId
      dispenseAsWritten: $dispenseAsWritten
      dispenseQuantity: $dispenseQuantity
      dispenseUnit: $dispenseUnit
      refillsAllowed: $refillsAllowed
      fillsAllowed: $fillsAllowed
      daysSupply: $daysSupply
      instructions: $instructions
      notes: $notes
      effectiveDate: $effectiveDate
      diagnoses: $diagnoses
    ) {
      id
    }
  }
`;

interface PrescribeProviderProps {
  children: JSXElement;
  templateIdsPrefill: string[];
  templateOverrides: TemplateOverrides;
  prescriptionIdsPrefill: string[];
  patientId: string;
}

export const PrescribeProvider = (props: PrescribeProviderProps) => {
  const [prescriptionIds, setPrescriptionIds] = createSignal<string[]>([]);
  const [isLoading, setIsLoading] = createSignal<boolean>(false);
  const [hasCreatedPrescriptions, setHasCreatedPrescriptions] = createSignal<boolean>(false);

  const client = usePhotonClient();

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
    const prescriptionsToCreate = [];

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
      prescriptionsToCreate.map(async (prescription: Prescription) =>
        createPrescription(prescription)
      )
    );
    setIsLoading(false);
  }

  const createPrescription = async (prescription: Prescription) => {
    try {
      console.log('createPrescription called', prescription, {
        externalId: prescription.externalId,
        patientId: props.patientId,
        treatmentId: prescription.treatment?.id,
        dispenseAsWritten: prescription.dispenseAsWritten,
        dispenseQuantity: prescription.dispenseQuantity,
        dispenseUnit: prescription.dispenseUnit,
        fillsAllowed: prescription.fillsAllowed,
        daysSupply: prescription.daysSupply,
        instructions: prescription.instructions,
        notes: prescription.notes,
        effectiveDate: format(new Date(), 'yyyy-MM-dd').toString(),
        diagnoses: prescription.diagnoses
      });
      const res = await client!.apollo.mutate({
        mutation: CreatePrescription,
        variables: {
          externalId: prescription.externalId,
          patientId: props.patientId,
          treatmentId: prescription.treatment?.id,
          dispenseAsWritten: prescription.dispenseAsWritten,
          dispenseQuantity: prescription.dispenseQuantity,
          dispenseUnit: prescription.dispenseUnit,
          fillsAllowed: prescription.fillsAllowed,
          daysSupply: prescription.daysSupply,
          instructions: prescription.instructions,
          notes: prescription.notes,
          effectiveDate: format(new Date(), 'yyyy-MM-dd').toString(),
          diagnoses: prescription.diagnoses
        }
      });
      console.log('createPrescription res', res);
      console.log('prescriptionIds', [...prescriptionIds(), res.data.createPrescription.id]);
      setPrescriptionIds([...prescriptionIds(), res.data.createPrescription.id]);
    } catch (error) {
      console.error('Mutation error:', error);
    }
  };

  const value = {
    // values
    prescriptionIds,
    isLoading,
    // actions
    setPrescriptionIds,
    createPrescription
  };

  return <PrescribeContext.Provider value={value}>{props.children}</PrescribeContext.Provider>;
};

export const usePrescribe = () => {
  return useContext(PrescribeContext);
};
