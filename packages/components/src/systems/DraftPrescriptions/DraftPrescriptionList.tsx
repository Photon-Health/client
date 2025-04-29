import { Prescription, PrescriptionTemplate } from '@photonhealth/sdk/dist/types';
import { For, Show } from 'solid-js';
import Banner from '../../particles/Banner';
import Text from '../../particles/Text';
import { ScreeningAlertType } from '../ScreeningAlerts';
import { useDraftPrescriptions } from './DraftPrescriptionsProvider';
import { usePrescribe } from '../PrescribeProvider';
import { DraftPrescriptionLayout, DraftPrescriptionListItem } from './DraftPrescriptionListItem';

export type DraftPrescription = PrescriptionTemplate & {
  refillsInput?: number;
  addToTemplates?: boolean;
  catalogId?: string;
  effectiveDate?: string;
  externalId?: string;
};

interface DraftPrescriptionsProps {
  handleEdit?: (prescription: Prescription) => void;
  handleDelete?: (prescriptionId: string) => void;
  error?: string;
  screeningAlerts: ScreeningAlertType[];
  enableOrder?: boolean;
}

export function DraftPrescriptionList(props: DraftPrescriptionsProps) {
  const { draftPrescriptions } = useDraftPrescriptions();
  const { isLoadingPrefills, prescriptionIds, coverageOptions } = usePrescribe();

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
            ? 'Add prescription(s) before sending an order'
            : 'Add prescription(s) before saving'}
        </Banner>
      </Show>

      {/* Show when Drafts */}
      <Show when={!isLoadingPrefills() && draftPrescriptions().length > 0}>
        <For each={draftPrescriptions()}>
          {(draftPrescription) => (
            <DraftPrescriptionListItem
              screeningAlerts={props.screeningAlerts}
              draft={draftPrescription}
              coverageOptions={coverageOptions().filter(
                (c) => c.prescriptionId === draftPrescription.id
              )}
              handleEdit={props.handleEdit}
              handleDelete={props.handleDelete}
            />
          )}
        </For>
      </Show>
    </div>
  );
}
