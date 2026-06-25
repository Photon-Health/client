import { For, Show } from 'solid-js';
import { ScreeningAlert } from './ScreeningAlert';
import { PrescriptionScreeningAlert } from '@photonhealth/sdk/dist/clinical-api/types';

/**
 * This component represents multiple alerts for a given entity.
 *
 * The owningId property is used to demonstrate that this alert is attached to the provided ID
 * and as a result filters out any information that is made superfluous by nature of the relationship.
 */
export const ScreeningAlerts = (props: {
  screeningAlerts: PrescriptionScreeningAlert[];
  owningId?: string;
}) => {
  return (
    <Show when={props.screeningAlerts.length > 0}>
      <div class="grid gap-4">
        <For each={props.screeningAlerts}>
          {(screeningAlert) => (
            <ScreeningAlert screeningAlert={screeningAlert} owningId={props.owningId} />
          )}
        </For>
      </div>
    </Show>
  );
};
