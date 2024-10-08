import Icon from '../../particles/Icon';
import Text from '../../particles/Text';

export interface ScreeningAlertType {
  description: string;
  type: string;
  severity: string;
  involvedEntityIds: string[];
}

const getSeverityText = (severity: string) => {
  return severity.charAt(0).toUpperCase() + severity.slice(1);
};

const getSeverityBorderColor = (severity: string) => {
  switch (severity) {
    case 'minor':
      return 'border-blue-200 ';
    case 'moderate':
      return 'border-yellow-200';
    case 'major':
      return 'border-red-200';
  }
};

const getSeverityBackgroundColor = (severity: string) => {
  switch (severity) {
    case 'minor':
      return 'bg-blue-50 ';
    case 'moderate':
      return 'bg-yellow-50';
    case 'major':
      return 'bg-red-50';
  }
};

const getSeverityIconColor = (severity: string) => {
  switch (severity) {
    case 'minor':
      return 'text-blue-800 ';
    case 'moderate':
      return 'text-yellow-800';
    case 'major':
      return 'text-red-800';
  }
};

const getDescriptorOfOwningId = (owningId: string) => {
  const firstThreeChars = owningId.slice(0, 3);

  if (firstThreeChars === 'med') {
    return 'Pending Rx';
  }

  if (firstThreeChars === 'rx_') {
    return 'Existing Rx';
  }

  return 'TBD';
};

export const ScreeningAlert = (props: { owningId: string; screeningAlert: ScreeningAlertType }) => {
  return (
    <div
      class={`flex flex-col border rounded-lg ${getSeverityBorderColor(
        props.screeningAlert.severity
      )} ${getSeverityBackgroundColor(props.screeningAlert.severity)} `}
    >
      <div>
        <Icon
          name="exclamationCircle"
          class={`mr-2 ${getSeverityIconColor(props.screeningAlert.severity)}`}
        />
      </div>
      <div>
        <Text bold class="mb-2">
          {getSeverityText(props.screeningAlert.severity)}
        </Text>
        {' interaction with '}
        <Text bold class="mb-2">
          {props.owningId}
        </Text>
        {` (${getDescriptorOfOwningId(props.owningId)})`}
      </div>
      <div>
        <Text size="sm">{props.screeningAlert.description}</Text>
      </div>
    </div>
  );
};
