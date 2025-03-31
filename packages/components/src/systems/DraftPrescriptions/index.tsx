import { PrescriptionTemplate } from '@photonhealth/sdk/dist/types';
import gql from 'graphql-tag';
import { createSignal, For, JSXElement, createEffect, Show } from 'solid-js';
import Banner from '../../particles/Banner';
import Card from '../../particles/Card';
import Icon from '../../particles/Icon';
import Text from '../../particles/Text';
import formatRxString from '../../utils/formatRxString';
import { usePhotonClient } from '../SDKProvider';
import generateDraftPrescription from './utils/generateDraftPrescription';
import { ScreeningAlerts, ScreeningAlertType } from '../ScreeningAlerts';

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
  externalId?: string;
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
  prescriptionIds: string[];
  handleEdit?: (prescriptionId: string) => void;
  handleDelete?: (prescriptionId: string) => void;
  error?: string;
  screeningAlerts: ScreeningAlertType[];
  enableOrder?: boolean;
}

export default function DraftPrescriptions(props: DraftPrescriptionsProps) {
  const [isLoading, setIsLoading] = createSignal<boolean>(true);
  const [draftPrescriptions, setDraftPrescriptions] = createSignal<DraftPrescription[]>([]);
  const client = usePhotonClient();

  createEffect(() => {
    if (props.prescriptionIds.length > 0) {
      fetchDrafts();
    } else {
      setDraftPrescriptions([]);
      setIsLoading(false);
    }
  });

  async function fetchDrafts() {
    setIsLoading(true);

    // fetch prescriptions
    if (props.prescriptionIds.length > 0) {
      // for each prescriptionId, find the prescription by id and set the draft prescription
      const prescriptions = await Promise.allSettled(
        props.prescriptionIds.map(async (prescriptionId: string) => {
          const { data } = await client!.apollo.query({
            query: GetPrescription,
            variables: {
              id: prescriptionId
            }
          });
          console.log('data', data);
          const prescription = data?.prescription;

          if (!prescription) {
            return console.error(`Invalid prescription id ${prescriptionId}`);
          }

          return generateDraftPrescription(prescription);
        })
      );

      const filteredPrescriptions = prescriptions
        .map((p) => (p.status === 'fulfilled' ? p.value : null))
        .filter((p): p is DraftPrescription => p !== null);

      setDraftPrescriptions(filteredPrescriptions);
    }
    setIsLoading(false);
  }

  return (
    <div class="space-y-3">
      {/* Show when Loading */}
      <Show when={isLoading()}>
        <For each={props.prescriptionIds}>
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
      <Show when={!isLoading() && props.prescriptionIds.length === 0}>
        <Banner status="info">
          {props.enableOrder
            ? 'Add prescription(s) before sending an order'
            : 'Add prescription(s) before saving'}
        </Banner>
      </Show>

      {/* Show when Drafts */}
      <Show when={!isLoading() && draftPrescriptions().length > 0}>
        <For each={draftPrescriptions()}>
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
                    <button
                      onClick={() => props.handleEdit && props.handleEdit(draft.id)}
                      title="Edit"
                    >
                      <Icon
                        name="pencilSquare"
                        size="sm"
                        class="text-gray-500 hover:text-amber-500"
                      />
                    </button>
                    <button
                      onClick={() => props.handleDelete && props.handleDelete(draft.id)}
                      title="Delete"
                    >
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
