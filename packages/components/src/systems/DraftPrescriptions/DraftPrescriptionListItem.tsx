import { Prescription } from '@photonhealth/sdk/dist/types';
import { createMemo, JSXElement, Show } from 'solid-js';
import Card from '../../particles/Card';
import Icon from '../../particles/Icon';
import Text from '../../particles/Text';
import formatRxString from '../../utils/formatRxString';
import { ScreeningAlerts, ScreeningAlertType } from '../ScreeningAlerts';
import { CoverageOption, PrescriptionFormData } from '../PrescribeProvider';
import { CoverageOptionSummary } from './CoverageOptions/CoverageOptionSummary';
import { AlternativeCoverageOptionList } from './CoverageOptions/AlternativeCoverageOptionList';
import { toPrescriptionFormData } from './utils/mappers';

interface DraftPrescriptionListItemProps {
  draft: Prescription;
  coverageOptions: CoverageOption[];
  handleEdit?: (prescription: PrescriptionFormData) => void;
  handleDelete?: (prescriptionId: string) => void;
  handleSwapToAlternative: (alternative: PrescriptionFormData) => void;
  screeningAlerts: ScreeningAlertType[];
}

export function DraftPrescriptionListItem(props: DraftPrescriptionListItemProps) {
  // we'll want to ensure that we're only rendering
  // alerts for the prescription being rendered
  const screeningAlertsForDraft = createMemo(() =>
    props.screeningAlerts.filter(
      (screeningAlert) =>
        screeningAlert.involvedEntities
          .map((involvedEntity) => involvedEntity.id)
          .indexOf(props.draft.treatment.id) >= 0
    )
  );

  const currentCoverageOption = createMemo(() => {
    return props.coverageOptions.find((coverage) => !coverage.isAlternative);
  });

  const otherCoverageOptions = createMemo(() => {
    return props.coverageOptions.filter((coverage) => coverage.isAlternative);
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
          <button
            onClick={() =>
              props.handleEdit && props.handleEdit(toPrescriptionFormData(props.draft))
            }
            title="Edit"
          >
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
          <Show when={screeningAlertsForDraft().length > 0}>
            <ScreeningAlerts
              screeningAlerts={screeningAlertsForDraft()}
              owningId={props.draft.treatment.id}
            />
          </Show>
          <Show when={currentCoverageOption()}>
            {(coverageOption) => <CoverageOptionSummary coverageOption={coverageOption()} />}
          </Show>

          <Show when={otherCoverageOptions().length > 0}>
            <AlternativeCoverageOptionList
              coverageOptions={otherCoverageOptions()}
              handleSwapToAlternative={props.handleSwapToAlternative}
            />
          </Show>
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
          {(rightChildren) => <div class="flex items-start gap-3"> {rightChildren()}</div>}
        </Show>
      </div>
      <Show when={props?.BottomChildren}>{(bottomChildren) => bottomChildren()}</Show>
    </div>
  </Card>
);
