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
    <>
      {groupAlertsByEntities(props.screeningAlerts).map((screeningAlertByEntity) => (
        <ScreeningAlertByEntity screeningAlertByEntity={screeningAlertByEntity} />
      ))}
    </>
  );
};
