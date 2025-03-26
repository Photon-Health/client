import { Catalog, PrescriptionTemplate } from '@photonhealth/sdk/dist/types';
import gql from 'graphql-tag';
import { createMemo, createSignal, For, JSXElement, mergeProps, onMount, Show } from 'solid-js';
import Banner from '../../particles/Banner';
import Card from '../../particles/Card';
import Icon from '../../particles/Icon';
import Text from '../../particles/Text';
import formatRxString from '../../utils/formatRxString';
import { usePhotonClient } from '../SDKProvider';
import generateDraftPrescription from './utils/generateDraftPrescription';
import { ScreeningAlerts, ScreeningAlertType } from '../ScreeningAlerts';

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

// Can't use a fragment because of the type difference between Prescription and PrescriptionTemplate
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

export type DraftPrescription = PrescriptionTemplate & {
  refillsInput?: number;
  addToTemplates?: boolean;
  catalogId?: string;
  effectiveDate?: string;
};

const DraftPrescription = (props: {
  LeftChildren: JSXElement;
  RightChildren?: JSXElement;
  BottomChildren?: JSXElement;
}) => (
  <Card>
    <div class="flex flex-col gap-4">
      <div class="flex justify-between items-center gap-4">
        <div class="flex flex-col items-start">{props.LeftChildren}</div>
        <Show when={props?.RightChildren}>
          <div class="flex items-start gap-3">{props.RightChildren}</div>
        </Show>
      </div>
      <Show when={props?.BottomChildren}>{props.BottomChildren}</Show>
    </div>
  </Card>
);

interface DraftPrescriptionsProps {
  draftPrescriptions: DraftPrescription[];
  templateIds?: string[];
  templateOverrides?: TemplateOverrides;
  prescriptionIds?: string[];
  setDraftPrescriptions: (draftPrescriptions: DraftPrescription[]) => void;
  handleEdit?: (draftId: string) => void;
  handleDelete?: (draftId: string) => void;
  error?: string;
  screeningAlerts: ScreeningAlertType[];
  enableOrder?: boolean;
}

export default function DraftPrescriptions(props: DraftPrescriptionsProps) {
  const merged = mergeProps(
    {
      draftPrescriptions: [] as string[],
      templateIds: [] as string[],
      templateOverrides: {} as TemplateOverrides,
      prescriptionIds: [] as string[]
    },
    props
  );

  const [isLoading, setIsLoading] = createSignal<boolean>(true);
  const client = usePhotonClient();

  const allDraftPrescriptionIds = createMemo(() => [
    ...merged.templateIds,
    ...merged.prescriptionIds
  ]);

  async function fetchDrafts() {
    setIsLoading(true);
    const draftPrescriptions: DraftPrescription[] = [];

    // fetch templates
    if (merged.templateIds.length > 0) {
      const { data } = await client!.apollo.query({ query: GetTemplatesFromCatalogs });

      if (data?.catalogs) {
        // get all templates, most likely only one catalog
        const templates = data.catalogs.reduce(
          (acc: PrescriptionTemplate[], catalog: Catalog) => [...acc, ...catalog.templates],
          []
        );

        // for each templateId, find the template by id and set the draft prescription
        merged.templateIds.forEach((templateId: string) => {
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
            const templateOverride = merged?.templateOverrides?.[template.id];
            const updatedTemplate = templateOverride
              ? { ...template, ...templateOverride }
              : template;

            draftPrescriptions.push(generateDraftPrescription(updatedTemplate));
          }
        });
      }
    }

    // fetch prescriptions
    if (merged.prescriptionIds.length > 0) {
      // for each prescriptionId, find the prescription by id and set the draft prescription
      await Promise.allSettled(
        merged.prescriptionIds.map(async (prescriptionId: string) => {
          const { data } = await client!.apollo.query({
            query: GetPrescription,
            variables: {
              id: prescriptionId
            }
          });

          const prescription = data?.prescription;

          if (!prescription) {
            return console.error(`Invalid prescription id ${prescriptionId}`);
          }

          draftPrescriptions.push(generateDraftPrescription(prescription));
        })
      );
    }
    if (draftPrescriptions.length > 0) {
      props.setDraftPrescriptions(draftPrescriptions);
    }
    setIsLoading(false);
  }

  onMount(() => {
    if (allDraftPrescriptionIds().length > 0) {
      fetchDrafts();
    } else {
      setIsLoading(false);
    }
  });

  return (
    <div class="space-y-3">
      {/* Show when Loading */}
      <Show when={isLoading()}>
        <For each={allDraftPrescriptionIds()}>
          {() => (
            <DraftPrescription
              LeftChildren={
                <>
                  <Text size="lg" sampleLoadingText="Medication 100mg" loading />
                  <Text size="sm" sampleLoadingText="Loading notes about the medication" loading />
                </>
              }
            />
          )}
        </For>
      </Show>

      {/* Show when No Drafts */}
      <Show when={!isLoading() && merged.draftPrescriptions.length === 0}>
        <Banner status="info">
          {merged.enableOrder
            ? 'Add prescription(s) before sending an order'
            : 'Add prescription(s) before saving'}
        </Banner>
      </Show>

      {/* Show when Drafts */}
      <Show when={!isLoading() && merged.draftPrescriptions.length > 0}>
        <For each={merged.draftPrescriptions}>
          {(draft: DraftPrescription) => {
            // we'll want to ensure that we're only rendering
            // alerts for the prescription being rendered
            const screeningAlertsForDraft = props.screeningAlerts.filter(
              (screeningAlert) =>
                screeningAlert.involvedEntities
                  .map((involvedEntity) => involvedEntity.id)
                  .indexOf(draft.treatment.id) >= 0
            );

            return (
              <DraftPrescription
                LeftChildren={
                  <>
                    <Text>{draft.treatment.name}</Text>
                    <Text color="gray" size="sm">
                      {formatRxString({
                        // need to use nullish coalescing here because draft types are eg `Maybe<number> | undefined`
                        dispenseQuantity: draft?.dispenseQuantity ?? undefined,
                        dispenseUnit: draft?.dispenseUnit ?? undefined,
                        fillsAllowed: draft?.fillsAllowed ?? undefined,
                        instructions: draft?.instructions ?? undefined
                      })}
                    </Text>
                  </>
                }
                RightChildren={
                  <>
                    <button onClick={() => merged.handleEdit && merged.handleEdit(draft.id)}>
                      <Icon
                        name="pencilSquare"
                        size="sm"
                        class="text-gray-500 hover:text-amber-500"
                      />
                    </button>
                    <button onClick={() => merged.handleDelete && merged.handleDelete(draft.id)}>
                      <Icon name="trash" size="sm" class="text-gray-500 hover:text-red-500" />
                    </button>
                  </>
                }
                BottomChildren={
                  <Show when={screeningAlertsForDraft.length > 0}>
                    <ScreeningAlerts
                      screeningAlerts={screeningAlertsForDraft}
                      owningId={draft.treatment.id}
                    />
                  </Show>
                }
              />
            );
          }}
        </For>
      </Show>
    </div>
  );
}
