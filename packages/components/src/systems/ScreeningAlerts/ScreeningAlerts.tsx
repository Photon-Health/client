import { ScreeningAlert } from './ScreeningAlert';

export const ScreeningAlerts = (props: { screeningAlerts: any[]; owningId: string }) => {
  return (
    <>
      {props.screeningAlerts
        .filter((screeningAlert) => screeningAlert.involvedEntityIds.indexOf(props.owningId) > 0)
        .map((screeningAlert) => (
          <ScreeningAlert screeningAlert={screeningAlert} owningId={props.owningId} />
        ))}
    </>
  );
};
