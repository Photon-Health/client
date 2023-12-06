import { useRecentOrders } from '.';
import Button from '../../particles/Button';
import Dialog from '../../particles/Dialog';
import Icon from '../../particles/Icon';
import Text from '../../particles/Text';

export default function RecentOrdersDuplicateDialog() {
  const [state, actions] = useRecentOrders();

  return (
    <Dialog
      open={state.isDuplicateDialogOpen}
      onClose={() => actions.setIsDuplicateDialogOpen(false)}
    >
      <div class="flex flex-col gap-6">
        <div>
          <div class="table bg-red-50 text-red-600 p-2 rounded-full mb-4">
            <Icon name="exclamationCircle" />
          </div>
          <Text bold class="mb-2">
            Looks like a duplicate order
          </Text>
          <Text>This patient already has an order for th esame prescription:</Text>
        </div>

        <div class="border border-solid border-gray-200 rounded-lg bg-gray-50 py-3 px-4">
          <Text size="sm">Cefdinir 200 mg Oral Capsule</Text>
          <Text size="sm" color="gray">
            30 Each, 11 Refills - Take 1 (one) daily
          </Text>
        </div>

        <div class="flex flex-col items-stretch gap-4">
          <Button size="xl">Report Issue</Button>
          <Button variant="naked" size="xl" onClick={() => actions.setIsDuplicateDialogOpen(false)}>
            Go Back
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
