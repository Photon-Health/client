import { createSignal, For } from 'solid-js';
import Icon from '../../particles/Icon';
import Text from '../../particles/Text';

export interface ScreeningAlertType {
  description: string;
  type: string;
  severity: string;
  involvedEntities: { id: string; name: string; type: string }[];
}

/**
 * Helper function to capitalize the severity
 */
const getSeverityText = (severity: string) => {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
};

/**
 * Helper function to get class names for styling based off of the severity
 */
const getColorBySeverity = (
  severity: string
): { icon: string; background: string; border: string } => {
  switch (severity) {
    default:
    case 'minor':
      return { icon: 'text-blue-800 ', background: 'bg-blue-50', border: 'border-blue-200' };
    case 'moderate':
      return { icon: 'text-yellow-800 ', background: 'bg-yellow-50', border: 'border-yellow-200' };
    case 'major':
      return { icon: 'text-red-800 ', background: 'bg-red-50', border: 'border-yellow-200' };
  }
};

/**
 * Helper function to get the human readable descriptor returned by the screening endpoint
 */
const getDescriptorByType = (type: string) => {
  switch (type) {
    case 'drafted_prescription':
      return '(Pending Prescription)';

    case 'existing_prescription':
      return '(Existing Prescription)';

    default:
      return '';
  }
};

/**
 * Helper function to filter out entities that are the same as the owningId
 * so we don't show unnecessary duplicate information that is present
 * by nature of the association
 */
const filterOutOwningId = (
  owningId: string,
  involvedEntities: { id: string; name: string; type: string }[]
): { id: string; name: string; type: string }[] => {
  return involvedEntities.filter((element) => element.id !== owningId);
};

/**
 * This component is used to display a single alert for prescription screening.
 *
 * The `owningId` property is used to demonstrate this alert's relationship to an entity
 * and will be used to filter out superfluous information otherwise highlighted by that relationship.
 */
export const ScreeningAlert = (props: { owningId: string; screeningAlert: ScreeningAlertType }) => {
  const [isExpanded, setIsExpanded] = createSignal<boolean>(false);

  const toggleExpandedState = () => {
    setIsExpanded(!isExpanded());
  };

  return (
    <div
      class={`border gap-4 rounded-lg ${getColorBySeverity(props.screeningAlert.severity).border} ${
        getColorBySeverity(props.screeningAlert.severity).background
      } `}
    >
      <div class="flex grid-flow-col justify-start">
        <div>
          <Icon
            name="exclamationCircle"
            class={`mr-2 ${getColorBySeverity(props.screeningAlert.severity).icon}`}
          />
        </div>
        <div>
          <div>
            <Text bold class="mb-2">
              {getSeverityText(props.screeningAlert.severity)}
            </Text>
            {' interaction with '}

            <For each={filterOutOwningId(props.owningId, props.screeningAlert.involvedEntities)}>
              {(entity, index) => {
                return (
                  <span>
                    <Text bold class="mb-2">
                      {entity.name}
                    </Text>
                    {' ' + getDescriptorByType(entity.type)}
                    {index() <
                      filterOutOwningId(props.owningId, props.screeningAlert.involvedEntities)
                        .length -
                        1 && ' and '}
                  </span>
                );
              }}
            </For>
          </div>
          <div class={`${!isExpanded() ? 'hidden' : ''}`}>
            <Text size="sm">{props.screeningAlert.description}</Text>
          </div>
          <div
            onClick={() => {
              toggleExpandedState();
            }}
          >
            <Text bold class="text-blue-40">
              Show {isExpanded() ? 'Less' : 'More'}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};
