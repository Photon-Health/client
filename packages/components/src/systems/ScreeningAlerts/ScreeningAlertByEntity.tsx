import { For, Show } from 'solid-js';
import Banner from '../../particles/Banner';
import { ScreeningAlertType } from './ScreeningAlert';
import Text from '../../particles/Text';
export interface AlertsForEntity {
  entity: { id: string; name: string; __typename: string };
  alerts: ScreeningAlertType[];
}

/**
 * Helper function to capitalize the severity
 */
const getSeverityText = (severity: string) => {
  return severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase();
};

const TYPE_TO_DESCRIPTOR_MAP: Record<string, string> = {
  PrescriptionScreeningAlertInvolvedDraftedPrescription: '(Pending Prescription)',
  PrescriptionScreeningAlertInvolvedExistingPrescription: '(Existing Prescription)',
  PrescriptionScreeningAlertInvolvedAllergen: '(Allergen)'
};

/**
 * Helper function to get the human readable descriptor returned by the screening endpoint
 */
const getDescriptorByType = (type: string): string => {
  return TYPE_TO_DESCRIPTOR_MAP[type] ?? '';
};

/**
 * Helper function to determine if the entity is an allergen
 */
const isTypenameAllergenBased = (typeName: string): boolean => {
  return typeName === 'PrescriptionScreeningAlertInvolvedAllergen';
};

/**
 * This component is used to show all alerts associated with a given entity in a succinct way.
 */
export const ScreeningAlertByEntity = (props: { screeningAlertByEntity: AlertsForEntity }) => {
  return (
    <Banner iconName="exclamationTriangle" status="suggestion">
      <div class="flex grid-flow-col justify-start">
        <div class="flex flex-col gap-2">
          <Show when={!isTypenameAllergenBased(props.screeningAlertByEntity.entity.__typename)}>
            <Text bold>{props.screeningAlertByEntity.entity.name}</Text>
            <For each={props.screeningAlertByEntity.alerts}>
              {(alert) => {
                return (
                  <For each={alert.involvedEntities}>
                    {(involvedEntity) => {
                      return (
                        <Show when={involvedEntity.id != props.screeningAlertByEntity.entity.id}>
                          <div class={`text-sm text-gray-700`}>
                            {getSeverityText(alert.severity)} interaction with {involvedEntity.name}{' '}
                            {getDescriptorByType(involvedEntity.__typename)}
                          </div>
                        </Show>
                      );
                    }}
                  </For>
                );
              }}
            </For>
          </Show>
          <Show when={isTypenameAllergenBased(props.screeningAlertByEntity.entity.__typename)}>
            <For each={props.screeningAlertByEntity.alerts}>
              {(alert) => {
                return <div class={`text-sm text-gray-700`}>{alert.description}</div>;
              }}
            </For>
          </Show>
        </div>
      </div>
    </Banner>
  );
};
