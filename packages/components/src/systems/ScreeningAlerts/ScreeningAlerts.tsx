import { For, Show } from 'solid-js';
import { ScreeningAlert, ScreeningAlertType } from './ScreeningAlert';

/**
 * This component represents multiple alerts for a given entity.
 *
 * The owningId property is used to demonstrate that this alert is attached to the provided ID
 * and as a result filters out any information that is made superfluous by nature of the relationship.
 */
export const ScreeningAlerts = (props: {
  screeningAlerts: ScreeningAlertType[];
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
