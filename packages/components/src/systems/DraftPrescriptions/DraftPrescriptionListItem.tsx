import { Prescription, PrescriptionTemplate } from '@photonhealth/sdk/dist/types';
import { createMemo, JSXElement, Show } from 'solid-js';
import Card from '../../particles/Card';
import Icon from '../../particles/Icon';
import Text from '../../particles/Text';
import formatRxString from '../../utils/formatRxString';
import { ScreeningAlerts, ScreeningAlertType } from '../ScreeningAlerts';
import { CoverageOptionsAlternatives } from './Coverage/CoverageOptionsAlternatives';
import { CoverageSummary } from './Coverage/CoverageSummary';
import { Coverage } from '../PrescribeProvider';

export type DraftPrescriptionListItem = PrescriptionTemplate & {
  refillsInput?: number;
  addToTemplates?: boolean;
  catalogId?: string;
  effectiveDate?: string;
  externalId?: string;
};

interface DraftPrescriptionListItemProps {
  draft: Prescription;
  coverages: Coverage[];
  handleEdit?: (prescription: Prescription) => void;
  handleDelete?: (prescriptionId: string) => void;
  screeningAlerts: ScreeningAlertType[];
}

export function DraftPrescriptionListItem(props: DraftPrescriptionListItemProps) {
  // we'll want to ensure that we're only rendering
  // alerts for the prescription being rendered
  const screeningAlertsForDraft = props.screeningAlerts.filter(
    (screeningAlert) =>
      screeningAlert.involvedEntities
        .map((involvedEntity) => involvedEntity.id)
        .indexOf(props.draft.treatment.id) >= 0
  );

  const draftCoverage = createMemo(() => {
    return props.coverages.find((coverage) => coverage.prescriptionId === props.draft.id);
  });

  return (
    <DraftPrescriptionLayout
      LeftChildren={
        <>
          <Text>{props.draft.treatment.name}</Text>
          <Text color="gray" size="sm">
            {formatRxString({
              // need to use nullish coalescing here because draft types are eg `Maybe<number> | undefined`
              dispenseQuantity: props.draft?.dispenseQuantity ?? undefined,
              dispenseUnit: props.draft?.dispenseUnit ?? undefined,
              fillsAllowed: props.draft?.fillsAllowed ?? undefined,
              instructions: props.draft?.instructions ?? undefined
            })}
          </Text>
        </>
      }
      RightChildren={
        <>
          <button onClick={() => props.handleEdit && props.handleEdit(props.draft)} title="Edit">
            <Icon name="pencilSquare" size="sm" class="text-gray-500 hover:text-amber-500" />
          </button>
          <button
            onClick={() => props.handleDelete && props.handleDelete(props.draft.id)}
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
              owningId={props.draft.treatment.id}
            />
          </Show>
          <Show when={draftCoverage()}>
            {(coverage) => <CoverageSummary prescription={props.draft} coverage={coverage()} />}
          </Show>

          <CoverageOptionsAlternatives prescription={props.draft} coverages={props.coverages} />
          {/*<CoverageAlternatives  coverages={coverages} />*/}
        </>
      }
    />
  );
}

export const DraftPrescriptionLayout = (props: {
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
