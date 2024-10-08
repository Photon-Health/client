import { ScreeningAlert, ScreeningAlertType } from './ScreeningAlert';

export const ScreeningAlerts = (props: {
  screeningAlerts: ScreeningAlertType[];
  owningId: string;
}) => {
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
