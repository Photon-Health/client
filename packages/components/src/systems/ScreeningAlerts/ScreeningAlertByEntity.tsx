import { For, Show } from 'solid-js';
import Banner from '../../particles/Banner';
import { ScreeningAlertType } from './ScreeningAlert';
import Text from '../../particles/Text';

interface Entity {
  id: string;
  name: string;
  __typename: string;
}
export interface AlertsForEntity {
  entity: Entity;
  alerts: ScreeningAlertType[];
}

/**
 * Helper function to capitalize the severity
 */
const getSeverityText = (severity: string) => {
  return severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase();
};

const TYPE_TO_DESCRIPTOR_MAP: Record<string, string> = {
  PrescriptionScreeningAlertInvolvedDraftedPrescription: '(Pending Rx)',
  PrescriptionScreeningAlertInvolvedExistingPrescription: '(Existing Rx)',
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
 * Helper function to remove re-subscribed drug entities
 * from showing it more than once
 */
function removeDuplicateEntities(entities: Entity[]): Entity[] {
  const seenIds = new Set<string>();
  return entities.filter((entity) => {
    if (seenIds.has(entity.id)) {
      return false;
    } else {
      seenIds.add(entity.id);
      return true;
    }
  });
}

/**
 * This component is used to show all alerts associated with a given entity in a succinct way.
 */
export const ScreeningAlertByEntity = (props: {
  screeningAlertByEntity: AlertsForEntity;
  otherAlertsByEntity: AlertsForEntity[];
}) => {
  return (
    <Banner withoutIcon withBorder status="suggestion">
      <div class="flex grid-flow-col justify-start">
        <div class="flex flex-col gap-2">
          <Show when={!isTypenameAllergenBased(props.screeningAlertByEntity.entity.__typename)}>
            <Text bold>{props.screeningAlertByEntity.entity.name}</Text>
            <For each={props.screeningAlertByEntity.alerts}>
              {(alert) => {
                return (
                  <For each={removeDuplicateEntities(alert.involvedEntities)}>
                    {(involvedEntity) => {
                      return (
                        <>
                          <Show when={!isTypenameAllergenBased(involvedEntity.__typename)}>
                            <Show
                              when={involvedEntity.id != props.screeningAlertByEntity.entity.id}
                            >
                              <div class={`text-sm text-gray-700`}>
                                {getSeverityText(alert.severity)} interaction with{' '}
                                {involvedEntity.name}{' '}
                                {getDescriptorByType(involvedEntity.__typename)}
                              </div>
                            </Show>
                          </Show>
                          {/* if we're an allergen we'll need to show the contents of the alert
                           instead of this text based off the names of the entities */}
                          <Show when={isTypenameAllergenBased(involvedEntity.__typename)}>
                            <For
                              each={props.otherAlertsByEntity.filter(
                                (otherAlertByEntity) =>
                                  otherAlertByEntity.entity.id === involvedEntity.id
                              )}
                            >
                              {(otherAlertByEntity) => {
                                return (
                                  <For
                                    each={otherAlertByEntity.alerts.filter(
                                      (otherAlertByEntity) => otherAlertByEntity.type === 'ALLERGEN'
                                    )}
                                  >
                                    {(otherAlert) => (
                                      <div class={`text-sm text-gray-700`}>
                                        {otherAlert.description}
                                      </div>
                                    )}
                                  </For>
                                );
                              }}
                            </For>
                          </Show>
                        </>
                      );
                    }}
                  </For>
                );
              }}
            </For>
          </Show>
        </div>
      </div>
    </Banner>
  );
};
