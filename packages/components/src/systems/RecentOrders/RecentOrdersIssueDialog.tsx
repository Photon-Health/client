import { createMemo, Show } from 'solid-js';
import { useRecentOrders } from '.';
import Button from '../../particles/Button';
import Dialog from '../../particles/Dialog';
import Text from '../../particles/Text';
import Textarea from '../../particles/Textarea';
import formatRxString from '../../utils/formatRxString';

export default function RecentOrdersIssueDialog() {
  const [state, actions] = useRecentOrders();

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
            <Show when={state?.duplicateFill}>
              <Text size="sm">{state?.duplicateFill?.treatment?.name}</Text>
              <Text size="sm" color="gray">
                {formatRxString({
                  dispenseQuantity: state?.duplicateFill?.prescription?.dispenseQuantity,
                  dispenseUnit: state?.duplicateFill?.prescription?.dispenseUnit,
                  fillsAllowed: state?.duplicateFill?.prescription?.fillsAllowed,
                  instructions: state?.duplicateFill?.prescription?.instructions
                })}
              </Text>
            </Show>
            <Show when={state?.orderWithIssue}>
              <Text size="sm">{state?.orderWithIssue?.fills?.[0]?.treatment?.name}</Text>
              <Text size="sm" color="gray">
                {formatRxString({
                  dispenseQuantity:
                    state?.orderWithIssue?.fills?.[0]?.prescription?.dispenseQuantity,
                  dispenseUnit: state?.orderWithIssue?.fills?.[0]?.prescription?.dispenseUnit,
                  fillsAllowed: state?.orderWithIssue?.fills?.[0]?.prescription?.fillsAllowed,
                  instructions: state?.orderWithIssue?.fills?.[0]?.prescription?.instructions
                })}
              </Text>
            </Show>
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
