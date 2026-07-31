import { For } from 'solid-js';
import Text from '../../particles/Text';
import { ScreeningAlert } from './ScreeningAlert';
import {
  PrescriptionScreeningAlert,
  PrescriptionScreeningAlertInvolvedDraftedPrescription
} from '@photonhealth/sdk/dist/clinical-api/types';

interface AlertsForPrescription {
  prescription: PrescriptionScreeningAlertInvolvedDraftedPrescription;
  alerts: PrescriptionScreeningAlert[];
}

const isDraftedPrescription = (
  entity: PrescriptionScreeningAlert['involvedEntities'][number]
): entity is PrescriptionScreeningAlertInvolvedDraftedPrescription =>
  (entity as PrescriptionScreeningAlertInvolvedDraftedPrescription).__typename ===
  'PrescriptionScreeningAlertInvolvedDraftedPrescription';

export function groupAlertsByPrescription(
  screeningAlerts: PrescriptionScreeningAlert[]
): AlertsForPrescription[] {
  const prescriptionMap = new Map<string, AlertsForPrescription>();

  for (const alert of screeningAlerts) {
    // loop through alerts for the drafted prescriptions and organize by prescription name
    // so multiple alerts for the same medication share a single group
    for (const prescription of alert.involvedEntities.filter(isDraftedPrescription)) {
      const group = prescriptionMap.get(prescription.name) ?? { prescription, alerts: [] };
      if (!group.alerts.includes(alert)) group.alerts.push(alert);
      prescriptionMap.set(prescription.name, group);
    }
  }

  return [...prescriptionMap.values()];
}

/**
 * This component renders alerts grouped by the prescriptions using the same banner UI as ScreeningAlert with each alert.
 */
export const ScreeningAlertsByEntity = (props: {
  screeningAlerts: PrescriptionScreeningAlert[];
}) => {
  return (
    <div class="grid gap-4">
      <For each={groupAlertsByPrescription(props.screeningAlerts)}>
        {(group) => (
          <div class="grid gap-2">
            <Text bold>{group.prescription.name}</Text>
            <For each={group.alerts}>
              {(alert) => (
                <ScreeningAlert screeningAlert={alert} owningId={group.prescription.id} />
              )}
            </For>
          </div>
        )}
      </For>
    </div>
  );
};
