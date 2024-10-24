import { For } from 'solid-js';
import { ScreeningAlertType } from './ScreeningAlert';
import { AlertsForEntity, ScreeningAlertByEntity } from './ScreeningAlertByEntity';

function groupAlertsByEntities(screeningAlerts: ScreeningAlertType[]): AlertsForEntity[] {
  const alertsByEntity = Object.values(
    screeningAlerts
      .flatMap((alert) =>
        alert.involvedEntities.map((involvedEntity) => ({ entity: involvedEntity, alert }))
      )
      .reduce((accumulator, item) => {
        const key = item.entity.id;
        if (!accumulator[key]) {
          accumulator[key] = { entity: item.entity, alerts: [] };
        }
        accumulator[key].alerts.push(item.alert);
        return accumulator;
      }, {} as Record<string, AlertsForEntity>)
  );

  return alertsByEntity;
}

/**
 * This component renders alerts grouped by the entities within
 */
export const ScreeningAlertsByEntity = (props: { screeningAlerts: ScreeningAlertType[] }) => {
  return (
    <div class="grid gap-4">
      <For
        each={groupAlertsByEntities(props.screeningAlerts).filter(
          (
            alertsForEntity // we'll never want allergens to show up as their own entity
          ) => alertsForEntity.entity.__typename != 'PrescriptionScreeningAlertInvolvedAllergen'
        )}
      >
        {(screeningAlertByEntity) => (
          <ScreeningAlertByEntity
            screeningAlertByEntity={screeningAlertByEntity}
            otherAlertsByEntity={groupAlertsByEntities(props.screeningAlerts)}
          />
        )}
      </For>
    </div>
  );
};
