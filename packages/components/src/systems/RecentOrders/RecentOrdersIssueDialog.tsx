import { Fill, Order } from '@photonhealth/sdk/dist/types';
import { createMemo, For } from 'solid-js';
import { useRecentOrders } from '.';
import Button from '../../particles/Button';
import Dialog from '../../particles/Dialog';
import Text from '../../particles/Text';
import Textarea from '../../particles/Textarea';
import formatRxString from '../../utils/formatRxString';

function uniqueFills(order: Order): Fill[] {
  const treatmentNames = new Set<string>();

  return order.fills.filter((fill) => {
    if (treatmentNames.has(fill.treatment.name)) {
      return false;
    }

    treatmentNames.add(fill.treatment.name);
    return true;
  });
}

export default function RecentOrdersIssueDialog() {
  const [state, actions] = useRecentOrders();

  const fills = createMemo(() => {
    if (state?.orderWithIssue) {
      return uniqueFills(state.orderWithIssue);
    }
    if (state?.duplicateFill) {
      return [state.duplicateFill];
    }
    return [];
  });

  return (
    <Dialog open={state.isIssueDialogOpen} onClose={() => actions.setIsIssueDialogOpen(false)}>
      <div class="flex flex-col gap-6">
        <div>
          <Text bold class="mb-2">
            Report issue with existing order
          </Text>
          <Text>Start an email thread with the Photon team to discuss next steps.</Text>
        </div>

        <div class="border border-solid border-gray-200 rounded-lg bg-gray-50 py-3 px-4 flex flex-col gap-4">
          <div class="flex flex-col">
            <Text size="xs" color="gray">
              PATIENT
            </Text>
            <Text size="sm">{state?.patientName}</Text>
          </div>
          <div class="flex flex-col">
            <Text size="xs" color="gray">
              PRESCRIPTION
            </Text>
            <div class="flex flex-col gap-y-4">
              <For each={fills()}>
                {(fill) => (
                  <div>
                    <Text size="sm">{fill.treatment.name}</Text>
                    <Text size="sm" color="gray">
                      {formatRxString({
                        dispenseQuantity: fill?.prescription?.dispenseQuantity,
                        dispenseUnit: fill?.prescription?.dispenseUnit,
                        fillsAllowed: fill?.prescription?.fillsAllowed,
                        instructions: fill?.prescription?.instructions
                      })}
                    </Text>
                  </div>
                )}
              </For>
            </div>
          </div>
        </div>

        <div>
          <Text size="xs" class="mb-2" bold>
            Description
          </Text>
          <Textarea placeholder="Describe issue with this order" />
        </div>

        <div class="flex flex-col items-stretch gap-4">
          <Button size="xl">Report Issue</Button>
          <Button variant="naked" size="xl" onClick={() => actions.setIsIssueDialogOpen(false)}>
            Go Back
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
