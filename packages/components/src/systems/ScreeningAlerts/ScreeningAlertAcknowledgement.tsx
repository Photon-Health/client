import { createContext, createEffect, Ref, useContext } from 'solid-js';
import Button from '../../particles/Button';
import Dialog from '../../particles/Dialog';
import Icon from '../../particles/Icon';
import Text from '../../particles/Text';
import { ScreeningAlertType } from './ScreeningAlert';

type ScreeningAlertAcknowledgementState = {
  alerts: ScreeningAlertType[];
  isOpen: boolean;
};

type ScreeningAlertAcknowledgementActions = {
  setIsAlertAcknowledgementDialogOpen: (
    isOpen: boolean,
    alerts?: ScreeningAlertType[],
    continueCb?: () => void
  ) => void;
};

type ScreeningAlertContextValue = [
  ScreeningAlertAcknowledgementState,
  ScreeningAlertAcknowledgementActions
];

const ScreeningAlertContext = createContext<ScreeningAlertContextValue>([
  {
    alerts: [],
    isOpen: false
  },
  {
    setIsAlertAcknowledgementDialogOpen: () => undefined
  }
]);

export function useScreeningAlertAcknowledgement() {
  return useContext(ScreeningAlertContext);
}

export default function RecentOrdersCombineDialog() {
  let ref: Ref<any> | undefined;
  const [state, actions] = useScreeningAlertAcknowledgement();

  createEffect(() => {
    if (state.isOpen) {
      //dispatchDatadogAction('prescribe-alerts-dialog-open', {}, ref);
    }
  });

  return (
    <Dialog
      open={state.isOpen}
      onClose={() => {
        //dispatchDatadogAction('prescribe-combine-dialog-exit', {}, ref);
        actions.setIsAlertAcknowledgementDialogOpen(false);
      }}
    >
      <div>
        <div class="flex flex-col gap-6" ref={ref}>
          <div>
            <div class="table bg-blue-50 text-blue-600 p-2 rounded-full mb-4">
              <Icon name="exclamationCircle" />
            </div>
            <Text bold>bro</Text>
          </div>

          <div class="flex flex-col gap-2">
            <Text>yep no prob</Text>
          </div>
        </div>

        <div class="flex flex-col items-stretch gap-2">
          <Button size="xl">go go go go!</Button>
          <Button
            variant="secondary"
            size="xl"
            onClick={() => {
              actions.setIsAlertAcknowledgementDialogOpen(false);
            }}
          >
            oh ibetter investigate
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
