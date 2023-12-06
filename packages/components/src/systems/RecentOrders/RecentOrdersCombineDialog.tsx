import { useRecentOrders } from '.';
import Button from '../../particles/Button';
import Dialog from '../../particles/Dialog';
import Icon from '../../particles/Icon';
import Text from '../../particles/Text';

export default function RecentOrdersCombineDialog() {
  const [state, actions] = useRecentOrders();

  return (
    <Dialog open={state.isCombineDialogOpen} onClose={() => actions.setIsCombineDialogOpen(false)}>
      <div class="flex flex-col gap-6">
        <div>
          <div class="table bg-blue-50 text-blue-600 p-2 rounded-full mb-4">
            <Icon name="exclamationCircle" />
          </div>
          <Text bold>Add prescription to recent order?</Text>
        </div>

        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <Text>This patient currently has an order for:</Text>
            <div class="border border-solid border-gray-200 rounded-lg bg-gray-50 py-3 px-4">
              <Text size="sm">Cefdinir 200 mg Oral Capsule</Text>
              <Text size="sm" color="gray">
                30 Each, 11 Refills - Take 1 (one) daily
              </Text>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <Text>
              Select YES to combine orders and enable the patient to send it to the same pharmacy:
            </Text>
            <div class="border border-solid border-gray-200 rounded-lg bg-gray-50 py-3 px-4">
              <Text size="sm">Cefdinir 200 mg Oral Capsule</Text>
              <Text size="sm" color="gray">
                30 Each, 11 Refills - Take 1 (one) daily
              </Text>
            </div>
          </div>
        </div>

        <div class="flex flex-col items-stretch gap-2">
          <Button size="xl">Yes, combine orders</Button>
          <Button
            variant="secondary"
            size="xl"
            onClick={() => actions.setIsCombineDialogOpen(false)}
          >
            No, send new order
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
