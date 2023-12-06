import { useRecentOrders } from '.';
import Button from '../../particles/Button';
import Dialog from '../../particles/Dialog';
import RadioGroup from '../../particles/RadioGroup';
import Text from '../../particles/Text';

export default function RecentOrdersCancelDialog() {
  const [state, actions] = useRecentOrders();

  return (
    <Dialog open={state.isCancelDialogOpen} onClose={() => actions.setIsCancelDialogOpen(false)}>
      <div class="flex flex-col gap-6">
        <div>
          <Text bold class="mb-2">
            Cancel this order?
          </Text>
        </div>

        <div class="border border-solid border-gray-200 rounded-lg bg-gray-50 py-3 px-4 flex flex-col gap-4">
          <div class="flex flex-col">
            <Text size="sm">Cefdinir 200 mg Oral Capsule</Text>
            <Text size="sm" color="gray">
              30 Each, 11 Refills - Take 1 (one) daily
            </Text>
          </div>
        </div>

        <RadioGroup
          legend="Please select a reason for cancelling"
          set={[
            'Wrong patient selected',
            'Wrong drug selected',
            'Wrong directions written',
            'Wrong pharmacy selected',
            'Therapy change',
            'Patient no longer taking',
            'Changing pharmacies',
            'Other'
          ]}
        />

        <div class="flex flex-col items-stretch gap-4">
          <Button size="xl" variant="danger">
            Cancel Order
          </Button>
          <Button variant="naked" size="xl" onClick={() => actions.setIsCancelDialogOpen(false)}>
            Don't cancel
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
