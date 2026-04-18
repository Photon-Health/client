import { createMemo, For, Show } from 'solid-js';
import Banner from '../../particles/Banner';
import Text from '../../particles/Text';
import { ScreeningAlertType } from '../ScreeningAlerts';
import { RoutingConstraint, getPrescriptionRoutingConstraints } from '../RoutingConstraints';
import { PrescriptionFormData, useDraftPrescriptions } from './DraftPrescriptionsProvider';
import { CoverageOption, usePrescribe } from '../PrescribeProvider';
import { DraftPrescriptionLayout, DraftPrescriptionListItem } from './DraftPrescriptionListItem';

interface DraftPrescriptionsProps {
  handleEdit?: (prescription: PrescriptionFormData) => void;
  handleDelete?: (prescriptionId: string) => void;
  handleSwapToOtherPrescription: (coverageOption: CoverageOption) => void;
  error?: string;
  screeningAlerts: ScreeningAlertType[];
  routingConstraints: RoutingConstraint[];
  enableOrder?: boolean;
}

export function DraftPrescriptionList(props: DraftPrescriptionsProps) {
  const { isLoadingPrefills, draftPrescriptions, prescriptionIds } = useDraftPrescriptions();
  const { coverageOptions } = usePrescribe();
  const prescriptionRoutingConstraints = createMemo((): Map<string, RoutingConstraint> => {
    return getPrescriptionRoutingConstraints(props.routingConstraints);
  });

  return (
    <div class="space-y-3">
      <Show when={isLoadingPrefills()}>
        <For each={prescriptionIds()}>
          {() => (
            <DraftPrescriptionLayout
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
            ? 'Add prescription(s) before sending'
            : 'Add prescription(s) before saving'}
        </Banner>
      </Show>

      {/* Show when Drafts */}
      <Show when={!isLoadingPrefills() && draftPrescriptions().length > 0}>
        <div class="flex flex-col gap-4">
          <For each={draftPrescriptions()}>
            {(draftPrescription) => (
              <DraftPrescriptionListItem
                screeningAlerts={props.screeningAlerts}
                routingConstraint={prescriptionRoutingConstraints().get(draftPrescription.id)}
                draft={draftPrescription}
                coverageOptions={coverageOptions().filter(
                  (c) => c.prescriptionId === draftPrescription.id
                )}
                handleEdit={props.handleEdit}
                handleDelete={props.handleDelete}
                handleSwapToOtherPrescription={props.handleSwapToOtherPrescription}
              />
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}
