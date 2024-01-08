import { createMemo, createSignal, For } from 'solid-js';
import gql from 'graphql-tag';
import { useRecentOrders } from '.';
import Button from '../../particles/Button';
import Dialog from '../../particles/Dialog';
import Icon from '../../particles/Icon';
import Text from '../../particles/Text';
import formatRxString from '../../utils/formatRxString';
import uniqueFills from '../../utils/uniqueFills';
import { usePhotonClient } from '../SDKProvider';
import triggerToast from '../../utils/toastTriggers';

const CREATE_PRESCRIPTIONS_MUTATION = gql`
  mutation CreatePrescriptions($prescriptions: [PrescriptionInput!]!) {
    createPrescriptions(prescriptions: $prescriptions) {
      id
    }
  }
`;

const COMBINE_ORDERS_MUTATION = gql`
  mutation UpdateOrder($orderId: ID!, $fills: [FillInput!]!) {
    updateOrder(id: $orderId, fills: $fills) {
      id
    }
  }
`;

export default function RecentOrdersCombineDialog() {
  const client = usePhotonClient();
  const [state, actions] = useRecentOrders();
  const [isCreatingOrder, setIsCreatingOrder] = createSignal(false);
  const [isCombiningOrders, setIsCombiningOrders] = createSignal(false);

  const routingOrder = createMemo(() => {
    return state.orders.find((order) => order.state === 'ROUTING');
  });

  const fillsWithRoutingState = createMemo(() => {
    const order = routingOrder();

    if (order) {
      return uniqueFills(order);
    }

    return [];
  });

  const createPrescriptions = async () => {
    return client!.apollo.mutate({
      mutation: CREATE_PRESCRIPTIONS_MUTATION,
      variables: {
        prescriptions: state.draftPrescriptions?.map((draft) => ({
          daysSupply: draft.daysSupply,
          dispenseAsWritten: draft.dispenseAsWritten,
          dispenseQuantity: draft.dispenseQuantity,
          dispenseUnit: draft.dispenseUnit,
          effectiveDate: draft.effectiveDate,
          instructions: draft.instructions,
          notes: draft.notes,
          patientId: state.patientId,
          // +1 here because we're using the refillsInput
          fillsAllowed: draft.refillsInput ? draft.refillsInput + 1 : 1,
          treatmentId: draft.treatment.id
        }))
      }
    });
  };

  const updateOrder = async (orderId: string, prescriptionIds: string[]) => {
    return client!.apollo.mutate({
      mutation: COMBINE_ORDERS_MUTATION,
      variables: { orderId, fills: prescriptionIds.map((id) => ({ prescriptionId: id })) }
    });
  };

  const combineOrders = async () => {
    const order = routingOrder();

    if (!order) {
      return;
    }

    setIsCombiningOrders(true);

    try {
      // Create prescriptions for the drafts
      const prescriptions = await createPrescriptions();

      // Add rxs to the order
      await updateOrder(
        order.id,
        prescriptions.data.createPrescriptions.map((rx: { id: string }) => rx.id)
      );

      // Trigger message to redirect to order page
    } catch (e) {
      console.error('error', e);

      triggerToast({
        status: 'info',
        header: 'Error combining orders',
        body: 'Your order wasn’t combined, please refresh the page.'
      });
    }
  };

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
              <For each={fillsWithRoutingState()}>
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

          <div class="flex flex-col gap-2">
            <Text>
              Select YES to combine orders and enable the patient to send it to the same pharmacy:
            </Text>
            <div class="border border-solid border-gray-200 rounded-lg bg-gray-50 py-3 px-4 flex flex-col gap-4">
              <For each={state.draftPrescriptions}>
                {(draft) => (
                  <div>
                    <Text size="sm">{draft.treatment.name}</Text>
                    <Text size="sm" color="gray">
                      {formatRxString({
                        dispenseQuantity: draft?.dispenseQuantity ?? 0,
                        dispenseUnit: draft?.dispenseUnit ?? '',
                        fillsAllowed: draft?.fillsAllowed ?? 0,
                        instructions: draft?.instructions ?? ''
                      })}
                    </Text>
                  </div>
                )}
              </For>
            </div>
          </div>
        </div>

        <div class="flex flex-col items-stretch gap-2">
          <Button
            size="xl"
            onClick={combineOrders}
            disabled={isCombiningOrders()}
            loading={isCombiningOrders()}
          >
            Yes, combine orders
          </Button>
          <Button
            variant="secondary"
            size="xl"
            onClick={() => {
              state.createOrder?.();
              setIsCreatingOrder(true);
            }}
            disabled={isCreatingOrder()}
            loading={isCreatingOrder()}
          >
            {isCreatingOrder() ? 'Creating order...' : 'No, send new order'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
