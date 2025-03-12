import { Catalog, PrescriptionTemplate } from '@photonhealth/sdk/dist/types';
import gql from 'graphql-tag';
import { createSignal, For, JSXElement, mergeProps, onMount, Show } from 'solid-js';
import Banner from '../../particles/Banner';
import Card from '../../particles/Card';
import Icon from '../../particles/Icon';
import Text from '../../particles/Text';
import { usePhotonClient } from '../SDKProvider';
import generateDraftPrescription from './utils/generateDraftPrescription';
import { ScreeningAlerts, ScreeningAlertType } from '../ScreeningAlerts';
import Button from '../../particles/Button';
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
    if (merged.templateIds.length > 0 || merged.prescriptionIds.length > 0) {
      fetchDrafts();
    } else {
      setIsLoading(false);
    }
  });

  return (
    <div class="space-y-3">
      {/* Show when Loading */}
      <Show when={isLoading()}>
        <For each={[...merged.templateIds, ...merged.prescriptionIds]}>
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
                  <>
                    <Show when={screeningAlertsForDraft.length > 0}>
                      <ScreeningAlerts
                        screeningAlerts={screeningAlertsForDraft}
                        owningId={draft.treatment.id}
                      />
                    </Show>

                    <div class="flex flex-col">
                      <div class="text-xs text-gray-500">
                        Quantity / Days Supply: <b>3 ML / 30 d/s</b>
                      </div>
                      <div class="text-xs text-gray-500">
                        Plan Pays: <b>$150</b>
                      </div>
                      <div class="text-xs text-gray-500">
                        Pharmacy: <b>Patient's Preferred</b>
                      </div>
                    </div>
                    <Banner status="success" withoutIcon={true}>
                      <div class="flex justify-between w-full">
                        <div class="text-xs">
                          <b>Covered by Insurance</b>
                        </div>
                        <div class="text-xs">
                          Est. Copay: <b>$291</b>
                        </div>
                      </div>
                    </Banner>
                    <div>Alternatives</div>
                    <Card>
                      <div class="flex flex-col gap-2">
                        <div class="flex flex-col gap-2">
                          <div class="flex flex-col gap-2">
                            <div class="text-sm">
                              Wegovy Subcutaneous Solution Auto-injector 0.25 MG/0.5ML
                            </div>

                            <div class="flex flex-col">
                              <div class="text-xs text-gray-500">
                                Quantity / Days Supply: <b>3 ML / 30 d/s </b>
                              </div>
                              <div class="text-xs text-gray-500">
                                Plan Pays: <b>$150</b>
                              </div>
                              <div class="text-xs text-gray-500">
                                Pharmacy: <b>CVS Pharmacy</b>
                              </div>
                            </div>
                            <Banner status="warning" withoutIcon={true}>
                              <div class="flex justify-between w-full">
                                <div class="text-xs">
                                  <b>PA Required</b>
                                </div>
                                <div class="text-xs">
                                  Est. Copay: <b>$122</b>
                                </div>
                              </div>
                            </Banner>
                          </div>
                        </div>
                        <div class="flex justify-end mt-2">
                          <Button size="sm" variant="naked">
                            Select Alternative
                          </Button>
                        </div>
                      </div>
                    </Card>
                    <Card>
                      <div class="flex flex-col gap-2">
                        <div class="flex flex-col gap-2">
                          <div class="flex flex-col gap-2">
                            <div class="text-sm">
                              Ozempic (0.25 or 0.5 MG/DOSE) Subcutaneous Solution Pen-injector 2
                              MG/3ML
                            </div>

                            <div class="flex flex-col">
                              <div class="text-xs text-gray-500">
                                Quantity / Days Supply: <b>3 ML / 30 d/s</b>
                              </div>
                              <div class="text-xs text-gray-500">
                                Plan Pays: <b>$150</b>
                              </div>
                              <div class="text-xs text-gray-500">
                                Pharmacy: <b>Walgreens Pharmacy</b>
                              </div>
                            </div>
                            <Banner status="success" withoutIcon={true}>
                              <div class="flex justify-between w-full">
                                <div class="text-xs">
                                  <b>Covered by Insurance</b>
                                </div>
                                <div class="text-xs">
                                  Est. Copay: <b>$321</b>
                                </div>
                              </div>
                            </Banner>
                          </div>
                        </div>
                        <div class="flex justify-end mt-2">
                          <Button size="sm" variant="naked">
                            Select Alternative
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </>
                }
              />
            );
          }}
        </For>
      </Show>
    </div>
  );
}
