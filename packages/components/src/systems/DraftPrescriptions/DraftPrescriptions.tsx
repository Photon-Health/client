import { Prescription, PrescriptionTemplate } from '@photonhealth/sdk/dist/types';
import { createMemo, For, JSXElement, Show } from 'solid-js';
import Banner from '../../particles/Banner';
import Card from '../../particles/Card';
import Icon from '../../particles/Icon';
import Text from '../../particles/Text';
import formatRxString from '../../utils/formatRxString';
import { ScreeningAlerts, ScreeningAlertType } from '../ScreeningAlerts';
import {
  RoutingConstraint,
  getPrescriptionRoutingConstraints,
  PrescriptionRoutingAlert
} from '../RoutingConstraints';
import { useDraftPrescriptions } from './DraftPrescriptionsProvider';
import { usePrescribe } from '../PrescribeProvider';

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
  handleEdit?: (prescription: Prescription) => void;
  handleDelete?: (prescriptionId: string) => void;
  error?: string;
  screeningAlerts: ScreeningAlertType[];
  routingConstraints: RoutingConstraint[];
  enableOrder?: boolean;
}

export function DraftPrescriptions(props: DraftPrescriptionsProps) {
  const { draftPrescriptions } = useDraftPrescriptions();
  const { isLoadingPrefills, prescriptionIds } = usePrescribe();
  const prescriptionRoutingConstraints = createMemo((): Map<string, RoutingConstraint> => {
    return getPrescriptionRoutingConstraints(props.routingConstraints);
  });

  return (
    <div class="space-y-3">
      <Show when={isLoadingPrefills()}>
        <For each={prescriptionIds()}>
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
      <Show when={!isLoadingPrefills() && prescriptionIds().length === 0}>
        <Banner status="info">
          {props.enableOrder
            ? 'Add prescription(s) before sending an order'
            : 'Add prescription(s) before saving'}
        </Banner>
      </Show>

      {/* Show when Drafts */}
      <Show when={!isLoadingPrefills() && draftPrescriptions().length > 0}>
        <For each={draftPrescriptions()}>
          {(draft) => {
            // we'll want to ensure that we're only rendering
            // alerts for the prescription being rendered
            const screeningAlertsForDraft = props.screeningAlerts.filter(
              (screeningAlert) =>
                screeningAlert.involvedEntities
                  .map((involvedEntity) => involvedEntity.id)
                  .indexOf(draft.treatment.id) >= 0
            );
            const routingConstraintForDraft = prescriptionRoutingConstraints().get(draft.id);
            const routingAlertForDraft =
              routingConstraintForDraft &&
              PrescriptionRoutingAlert({
                prescription: draft,
                routingConstraint: routingConstraintForDraft
              });

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
                      onClick={() => props.handleEdit && props.handleEdit(draft)}
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
                  <>
                    <Show when={screeningAlertsForDraft.length > 0}>
                      <ScreeningAlerts
                        screeningAlerts={screeningAlertsForDraft}
                        owningId={draft.treatment.id}
                      />
                    </Show>
                    <Show when={routingAlertForDraft}>{routingAlertForDraft}</Show>
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
