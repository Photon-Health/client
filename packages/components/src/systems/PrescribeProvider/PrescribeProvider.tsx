import { createContext, createSignal, JSXElement, onMount } from 'solid-js';
import { usePhotonClient } from '../SDKProvider';
import { Catalog } from '@photonhealth/sdk/dist/types';
import { PrescriptionTemplate } from '@photonhealth/sdk/dist/types';
import { DraftPrescription } from '../DraftPrescriptions';
import gql from 'graphql-tag';
import { groupBy } from 'lodash';

const PrescribeContext = createContext();

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

const GetPrescription = gql`
  query GetPrescription($id: ID!) {
    prescription(id: $id) {
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
`;

interface PrescribeProviderProps {
  children: JSXElement;
  templateIdsPrefill: string[];
  templateOverrides: TemplateOverrides;
  prescriptionIdsPrefill: string[];
}

export const PrescribeProvider = (props: PrescribeProviderProps) => {
  const [prescriptionIds, setPrescriptionIds] = createSignal<string[]>([]);
  const [isLoading, setIsLoading] = createSignal<boolean>(false);

  const client = usePhotonClient();

  const value = {
    // values
    prescriptionIds,
    isLoading,
    // actions
    setPrescriptionIds
  };

  onMount(() => {
    if (props.templateIdsPrefill.length > 0 || props.prescriptionIdsPrefill.length > 0) {
      createPrescriptionsFromIds();
    }
  });

  async function createPrescriptionsFromIds() {
    setIsLoading(true);
    const prescriptionsToCreate = [];

    // fetch templates
    if (props.templateIdsPrefill.length > 0) {
      const { data } = await client!.apollo.query({ query: GetTemplatesFromCatalogs });

      if (data?.catalogs) {
        // get all templates, most likely only one catalog
        const templates = data.catalogs.reduce(
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

            prescriptionsToCreate.push(updatedTemplate);
          }
        });
      }
      if (props.prescriptionIdsPrefill.length > 0) {
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
      }
    }

    console.log(prescriptionsToCreate);

    // create prescriptions from template and prescription ids
    await Promise.all(
      prescriptionsToCreate.map(async (prescription: Prescription) => {
        await client!.apollo.mutate({
          mutation: CreatePrescription,
          variables: { prescription }
        });
      })
    );
    setIsLoading(false);
  }

  return <PrescribeContext.Provider value={value}>{props.children}</PrescribeContext.Provider>;
};
