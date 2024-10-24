import { createSignal } from 'solid-js';
import Button from '../../particles/Button';
import Dialog from '../../particles/Dialog';
import Icon from '../../particles/Icon';
import Text from '../../particles/Text';
import { ScreeningAlertType } from './ScreeningAlert';
import { ScreeningAlertsByEntity } from './ScreeningAlertsByEntity';

type ScreeningAlertAcknowledgementDialogProps = {
  isOpen: boolean;
  alerts: ScreeningAlertType[];
  onIgnoreWarningAndCreateAnyway: () => void;
  onRevisitPrescriptions: () => void;
};

function formatWarning(alerts: ScreeningAlertType[]): string {
  const numAllergenWarnings = alerts.filter((alert) => alert.type === 'ALLERGEN').length;
  const numInteractionWarnings = alerts.filter((alert) => alert.type === 'DRUG').length;

  const warnings = [];

  if (numAllergenWarnings === 1) {
    warnings.push('a known allergy');
  } else if (numAllergenWarnings > 1) {
    warnings.push('known allergies');
  }

  if (numInteractionWarnings === 1) {
    warnings.push('a known interaction');
  } else if (numInteractionWarnings > 1) {
    warnings.push('known interactions');
  }

  return warnings.join(' and ');
}

export function ScreeningAlertAcknowledgementDialog(
  props: ScreeningAlertAcknowledgementDialogProps
) {
  const [isOpen, setIsOpen] = createSignal<boolean>(true);

  return (
    <Dialog
      open={isOpen()}
      onClose={() => {
        setIsOpen(false);
        props.onRevisitPrescriptions();
      }}
    >
      <div class="grid gap-6">
        <div class="flex flex-col gap-6">
          <div>
            <div class="table bg-blue-50 text-blue-600 p-2 rounded-full mb-4">
              <Icon name="exclamationCircle" />
            </div>
            <Text bold>
              Are you sure you want to send an order with {formatWarning(props.alerts)}?
            </Text>
          </div>
        </div>

        <ScreeningAlertsByEntity screeningAlerts={props.alerts} />

        <div class="flex flex-col items-stretch gap-2">
          <Button
            size="xl"
            onClick={() => {
              setIsOpen(false);
              props.onIgnoreWarningAndCreateAnyway();
            }}
          >
            Send Order
          </Button>
          <Button
            variant="secondary"
            size="xl"
            onClick={() => {
              setIsOpen(false);
              props.onRevisitPrescriptions();
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
