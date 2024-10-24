import { For } from 'solid-js';
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
    <div class="grid gap-4">
      <For
        each={props.screeningAlerts.filter(
          (screeningAlert) =>
            screeningAlert.involvedEntities
              .map((involvedEntity) => involvedEntity.id)
              .indexOf(props.owningId ?? '') >= 0
        )}
      >
        {(screeningAlert) => (
          <ScreeningAlert screeningAlert={screeningAlert} owningId={props.owningId} />
        )}
      </For>
    </div>
  );
};
