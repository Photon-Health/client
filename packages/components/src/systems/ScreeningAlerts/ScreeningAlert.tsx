import { createSignal, For, JSXElement, Show } from 'solid-js';
import Text from '../../particles/Text';
import Banner, { BannerStatus } from '../../particles/Banner';
import clsx from 'clsx';

export interface ScreeningAlertType {
  description: string;
  type: string;
  severity: string;
  involvedEntities: { id: string; name: string; __typename: string }[];
}

/**
 * Helper function to capitalize the severity
 */
const getSeverityText = (severity: string) => {
  return severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase();
};

/**
 * Helper function to get class names for styling based off of the severity
 */
const getStatus = (severity: string, type: string): BannerStatus => {
  if (type === 'ALLERGEN') {
    return 'suggestion';
  }

  switch (severity) {
    default:
    case 'MINOR':
      return 'info';
    case 'MODERATE':
      return 'warning';
    case 'MAJOR':
      return 'error';
  }
};

/**
 * Helper function to get the human readable descriptor returned by the screening endpoint
 */
const getDescriptorByType = (type: string): string => {
  switch (type) {
    case 'PrescriptionScreeningAlertInvolvedDraftedPrescription':
      return '(Pending Prescription)';

    case 'PrescriptionScreeningAlertInvolvedExistingPrescription':
      return '(Existing Prescription)';

    case 'PrescriptionScreeningAlertInvolvedAllergen':
      return '(Allergen)';

    default:
      return '';
  }
};

const textClasses = () => clsx('mr-2', {});

const getTitle = (props: { owningId?: string; screeningAlert: ScreeningAlertType }): JSXElement => {
  return (
    <Show
      when={props.screeningAlert.type === 'DRUG'}
      fallback={
        <Text bold class={textClasses()}>
          Allergy Found
        </Text>
      }
    >
      <>
        <Text bold class={textClasses()}>
          {getSeverityText(props.screeningAlert.severity)}
        </Text>
        <Text class={textClasses()}> interaction with</Text>
        <For each={filterOutOwningId(props.screeningAlert.involvedEntities, props.owningId)}>
          {(entity, index) => {
            return (
              <>
                <Text bold class={textClasses()}>
                  {entity.name}
                </Text>
                <Text class={textClasses()}>{getDescriptorByType(entity.__typename)}</Text>
                {index() <
                  filterOutOwningId(props.screeningAlert.involvedEntities, props.owningId).length -
                    1 && <Text class={textClasses()}>and</Text>}
              </>
            );
          }}
        </For>
      </>
    </Show>
  );
};

/**
 * Helper function to filter out entities that are the same as the owningId
 * so we don't show unnecessary duplicate information that is present
 * by nature of the association
 */
const filterOutOwningId = (
  involvedEntities: { id: string; name: string; __typename: string }[],
  owningId?: string
): { id: string; name: string; __typename: string }[] => {
  return involvedEntities.filter((element) => element.id !== owningId);
};

/**
 * This component is used to display a single alert for prescription screening.
 *
 * The `owningId` property is used to demonstrate this alert's relationship to an entity
 * and will be used to filter out superfluous information otherwise highlighted by that relationship.
 */
export const ScreeningAlert = (props: {
  owningId?: string;
  screeningAlert: ScreeningAlertType;
}) => {
  const [isExpanded, setIsExpanded] = createSignal<boolean>(false);

  const toggleExpandedState = () => {
    setIsExpanded(!isExpanded());
  };

  return (
    <Banner status={getStatus(props.screeningAlert.severity, props.screeningAlert.type)}>
      <div class="flex grid-flow-col justify-start">
        <div class="flex flex-col gap-2">
          <div class="text-sm"> {getTitle(props)}</div>
          <div class={`text-sm text-gray-700 ${!isExpanded() ? 'hidden' : ''}`}>
            {props.screeningAlert.description}
          </div>
          <div
            onClick={() => {
              toggleExpandedState();
            }}
          >
            <Text bold class="text-blue-600">
              Show {isExpanded() ? 'Less' : 'More'}
            </Text>
          </div>
        </div>
      </div>
    </Banner>
  );
};
