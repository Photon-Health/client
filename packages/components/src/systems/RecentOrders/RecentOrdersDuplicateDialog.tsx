import { createEffect, Ref } from 'solid-js';
import { useRecentOrders } from '.';
import Button from '../../particles/Button';
import Dialog from '../../particles/Dialog';
import Icon from '../../particles/Icon';
import Text from '../../particles/Text';
import { dispatchDatadogAction } from '../../utils/dispatchDatadogAction';
import formatRxString from '../../utils/formatRxString';

export default function RecentOrdersDuplicateDialog() {
  let ref: Ref<any> | undefined;
  const [state, actions] = useRecentOrders();

  createEffect(() => {
    if (state.isDuplicateDialogOpen) {
      dispatchDatadogAction(
        'prescribe-duplicate-dialog-open',
        {
          duplicate: state.duplicateFill,
          order: state.orderWithIssue
        },
        ref
      );
    }
  });

  return (
    <Dialog
      open={state.isDuplicateDialogOpen}
      onClose={() => {
        dispatchDatadogAction('prescribe-duplicate-dialog-exit', {}, ref);
        actions.setIsDuplicateDialogOpen(false);
      }}
    >
      <div class="flex flex-col gap-6" ref={ref}>
        <div>
          <div class="table bg-red-50 text-red-600 p-2 rounded-full mb-4">
            <Icon name="exclamationCircle" />
          </div>
          <Text bold class="mb-2">
            Looks like a duplicate order
          </Text>
          <Text>This patient already has an order for the same prescription:</Text>
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
            {new Date(state?.duplicateFill?.prescription?.writtenAt).toLocaleDateString()}
          </Text>
        </div>

        <div class="flex flex-col items-stretch gap-4">
          <Button
            size="xl"
            onClick={() => {
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
              dispatchDatadogAction('prescribe-duplicate-dialog-add-anyway', {}, ref);
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
              dispatchDatadogAction('prescribe-duplicate-dialog-exit', {}, ref);
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
