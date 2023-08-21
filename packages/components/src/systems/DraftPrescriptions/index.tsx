import { For, JSXElement, mergeProps, Show } from 'solid-js';
import Card from '../../particles/Card';
import Icon from '../../particles/Icon';
import Text from '../../particles/Text';

export interface DraftPrescription {
  id: string;
  effectiveDate: string;
  treatment: {
    name: string;
  };
  dispenseAsWritten: boolean;
  dispenseQuantity: number;
  dispenseUnit: string;
  daysSupply: number;
  refillsInput: number;
  instructions: string;
  notes: string;
  fillsAllowed: number;
  addToTemplates: boolean;
  catalogId: string;
}

interface DraftPrescriptionsProps {
  loading?: boolean;
  draftPrescriptions: DraftPrescription[];
  handleEdit?: (draftId: string) => void;
  handleDelete?: (draftId: string) => void;
}

const CardLayout = (props: { LeftChildren: JSXElement; RightChildren?: JSXElement }) => (
  <Card>
    <div class="flex justify-between items-center gap-4">
      <div class="flex flex-col items-start">{props.LeftChildren}</div>
      <Show when={props?.RightChildren}>
        <div class="flex flex-col items-start gap-3">{props.RightChildren}</div>
      </Show>
    </div>
  </Card>
);

export default function DraftPrescriptions(props: DraftPrescriptionsProps) {
  const merged = mergeProps({ draftPrescriptions: [], loading: false }, props);

  return (
    <div class="space-y-3">
      {/* Show when Loading */}
      <Show when={merged.loading}>
        <CardLayout
          LeftChildren={
            <>
              <Text size="lg" sampleLoadingText="Medication 100mg" loading />
              <Text size="sm" sampleLoadingText="Loading notes about the medication" loading />
            </>
          }
        />
      </Show>

      {/* Show when No Drafts */}
      <Show when={!merged.loading && merged.draftPrescriptions.length === 0}>
        <Text color="gray" class="italic">
          No prescriptions pending
        </Text>
      </Show>

      {/* Show when Drafts */}
      <Show when={!merged.loading && merged.draftPrescriptions.length > 0}>
        <For each={merged.draftPrescriptions}>
          {(draft: DraftPrescription) => {
            return (
              <CardLayout
                LeftChildren={
                  <>
                    <Text>{draft.treatment.name}</Text>
                    <Text color="gray" size="sm">
                      {draft.dispenseQuantity} {draft.dispenseUnit}, {draft.refillsInput} refills -{' '}
                      {draft.instructions}
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
              />
            );
          }}
        </For>
      </Show>
    </div>
  );
}
