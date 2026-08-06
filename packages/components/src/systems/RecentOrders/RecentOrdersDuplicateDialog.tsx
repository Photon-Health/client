import { useRecentOrders } from '.';
import Button from '../../particles/Button';
import Dialog from '../../particles/Dialog';
import Icon from '../../particles/Icon';
import Text from '../../particles/Text';
import formatRxString from '../../utils/formatRxString';
import { formatDate } from '../../utils/formatDate';

export default function RecentOrdersDuplicateDialog() {
  const [state, actions] = useRecentOrders();

  return (
    <Dialog
      open={state.isDuplicateDialogOpen}
      onClose={() => {
        state?.duplicateDialogCancelCb?.();
        actions.setIsDuplicateDialogOpen(false);
      }}
    >
      <div class="flex flex-col gap-6">
        <div>
          <div class="table bg-red-50 text-red-600 p-2 rounded-full mb-4">
            <Icon name="exclamationCircle" />
          </div>
          <Text bold class="mb-2">
            Looks like a duplicate order
          </Text>
          <Text>This patient already has the same prescription:</Text>
        </div>

        <div class="border border-solid border-gray-200 rounded-lg bg-gray-50 py-3 px-4">
          <Text size="sm">{state?.duplicateFill?.treatment?.name}</Text>
          <br />
          <Text size="sm" color="gray">
            {formatRxString({
              dispenseQuantity: state?.duplicateFill?.prescription?.dispenseQuantity,
              dispenseUnit: state?.duplicateFill?.prescription?.dispenseUnit,
              fillsAllowed: state?.duplicateFill?.prescription?.fillsAllowed,
              instructions: state?.duplicateFill?.prescription?.instructions
            })}
          </Text>
          <Text size="sm" color="gray">
            Written by {state?.duplicateFill?.prescription?.prescriber?.name?.full} on{' '}
            {formatDate(state?.duplicateFill?.prescription?.writtenAt)}
          </Text>
        </div>

        <div class="flex flex-col items-stretch gap-4">
          <Button
            size="xl"
            onClick={() => {
              state?.duplicateDialogCancelCb?.();
              actions.setIsDuplicateDialogOpen(false);
              actions.setIsIssueDialogOpen(true);
            }}
          >
            Report Issue
          </Button>
          <Button
            size="xl"
            variant="secondary"
            onClick={() => {
              state?.duplicateDialogContinueCb?.();
              actions.setIsDuplicateDialogOpen(false);
            }}
          >
            Add Prescriptions Anyway
          </Button>
          <Button
            variant="naked"
            size="xl"
            onClick={() => {
              state?.duplicateDialogCancelCb?.();
              actions.setIsDuplicateDialogOpen(false);
            }}
          >
            Go Back
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
