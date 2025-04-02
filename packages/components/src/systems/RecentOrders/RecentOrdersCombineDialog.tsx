import { createEffect, createMemo, createSignal, For, Ref } from 'solid-js';
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
import { Address } from '../PatientInfo';
import { dispatchDatadogAction } from '../../utils/dispatchDatadogAction';
import { createMutation } from '../../utils/createMutation';
import { DraftPrescription } from '../DraftPrescriptions';
import { Order } from '@photonhealth/sdk/dist/types';
import { GraphQLError } from 'graphql';

const CREATE_PRESCRIPTIONS_MUTATION = gql`
  mutation RecentOrdersCombineDialogCreatePrescriptions($prescriptions: [PrescriptionInput!]!) {
    createPrescriptions(prescriptions: $prescriptions) {
      id
    }
  }
`;

const COMBINE_ORDERS_MUTATION = gql`
  mutation RecentOrdersCombineDialogUpdateOrder($orderId: ID!, $fills: [FillInput!]!) {
    updateOrder(id: $orderId, fills: $fills) {
      id
      createdAt
      fills {
        id
        prescription {
          id
          dispenseQuantity
          dispenseUnit
          fillsAllowed
          instructions
          notes
        }
        treatment {
          name
        }
      }
    }
  }
`;

const CREATE_ORDER_MUTATION = gql`
  mutation RecentOrdersCombineDialogCreateOrder(
    $patientId: ID!
    $fills: [FillInput!]!
    $address: AddressInput!
  ) {
    createOrder(patientId: $patientId, fills: $fills, address: $address) {
      id
    }
  }
`;

type SuccessResponse = {
  id: string;
};

type SuccessCreatePrescriptions = { createPrescriptions: SuccessResponse[] };
type VariablesCreatePrescriptions = {
  prescriptions: Omit<DraftPrescription, 'id' | 'name' | 'isPrivate' | 'treatment'>[];
};

type SuccessCombineOrders = { updateOrder: SuccessResponse };
type VariablesCombineOrders = { orderId: string; fills: { prescriptionId: string }[] };

type SuccessCreateOrder = { createOrder: SuccessResponse };
type VariablesCreateOrder = {
  patientId: string;
  fills: { prescriptionId: string }[];
  address: Address;
};

export default function RecentOrdersCombineDialog() {
  let ref: Ref<any> | undefined;
  const client = usePhotonClient();
  const [state, actions] = useRecentOrders();
  const [isCreatingOrder, setIsCreatingOrder] = createSignal(false);
  const [isCombiningOrders, setIsCombiningOrders] = createSignal(false);

  const [createPrescriptionsMutation] = createMutation<
    SuccessCreatePrescriptions,
    VariablesCreatePrescriptions
  >(CREATE_PRESCRIPTIONS_MUTATION, {
    client: client!.apollo
  });
  const [combineOrdersMutation] = createMutation<SuccessCombineOrders, VariablesCombineOrders>(
    COMBINE_ORDERS_MUTATION,
    {
      client: client!.apollo
    }
  );
  const [createOrderMutation] = createMutation<SuccessCreateOrder, VariablesCreateOrder>(
    CREATE_ORDER_MUTATION,
    {
      client: client!.apollo
    }
  );

  const dispatchCombineOrderUpdated = (order: Order) => {
    const event = new CustomEvent('photon-order-combined', {
      composed: true,
      bubbles: true,
      detail: { order }
    });
    ref?.dispatchEvent(event);
  };

  const dispatchOrderCreated = (order: SuccessResponse) => {
    const event = new CustomEvent('photon-order-created', {
      composed: true,
      bubbles: true,
      detail: {
        order: order
      }
    });
    ref?.dispatchEvent(event);
  };

  const dispatchCombineOrderError = (err: GraphQLError) => {
    const event = new CustomEvent('photon-order-combine-error', {
      composed: true,
      bubbles: true,
      detail: {
        error: err.message
      }
    });
    ref?.dispatchEvent(event);
  };

  createEffect(() => {
    if (state.isCombineDialogOpen) {
      dispatchDatadogAction('prescribe-combine-dialog-open', {}, ref);
    }
  });

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
    console.log('createPrescriptions called');
    // TODO TODO TODO
    // createPrescriptionsMutation({
    //   variables: {
    //     prescriptions: (state.draftPrescriptions || []).map((draft) => ({
    //       daysSupply: draft.daysSupply,
    //       dispenseAsWritten: draft.dispenseAsWritten,
    //       dispenseQuantity: draft.dispenseQuantity,
    //       dispenseUnit: draft.dispenseUnit,
    //       effectiveDate: draft.effectiveDate,
    //       instructions: draft.instructions,
    //       notes: draft.notes,
    //       patientId: state.patientId,
    //       // +1 here because we're using the refillsInput
    //       fillsAllowed: draft.refillsInput ? draft.refillsInput + 1 : 1,
    //       treatmentId: draft.treatment.id
    //     }))
    //   }
  };

  const updateOrder = async (orderId: string, prescriptionIds: string[]) =>
    combineOrdersMutation({
      variables: { orderId, fills: prescriptionIds.map((id) => ({ prescriptionId: id })) }
    });

  const createOrder = async (patientId: string, prescriptionIds: string[], address: Address) =>
    createOrderMutation({
      variables: {
        patientId,
        fills: prescriptionIds.map((id) => ({ prescriptionId: id })),
        address
      }
    });

  const combineOrders = async () => {
    const order = routingOrder();

    if (!order) {
      return;
    }

    setIsCombiningOrders(true);
    dispatchDatadogAction('prescribe-combine-dialog-combining', {}, ref);

    let prescriptions;
    try {
      // Create prescriptions for the drafts
      prescriptions = await createPrescriptions();
    } catch (err) {
      triggerToast({
        header: 'Error Creating Prescriptions',
        body: (err as GraphQLError).message,
        status: 'error'
      });
      setIsCombiningOrders(false);
      setIsCreatingOrder(false);
      actions.setIsCombineDialogOpen(false);
      dispatchCombineOrderError(err as GraphQLError);
      return;
    }

    try {
      // Add rxs to the order
      const updatedOrder = await updateOrder(
        order.id,
        prescriptions.createPrescriptions.map((rx: SuccessResponse) => rx.id)
      );
      // Trigger message to redirect to order page
      dispatchCombineOrderUpdated(updatedOrder.updateOrder as Order);
      setIsCombiningOrders(false);
      return;
    } catch {
      // if there is an error updating an order, most likely because the order state has
      // changed since it was first fetched so we need to create a new order
      try {
        if (!state?.address || !state?.patientId) {
          throw new Error('No address provided');
        }

        const newOrder = await createOrder(
          state.patientId,
          prescriptions.createPrescriptions.map((rx: SuccessResponse) => rx.id),
          state.address
        );

        dispatchOrderCreated(newOrder.createOrder);
        setIsCombiningOrders(false);
      } catch {
        triggerToast({
          header: 'Error Creating Order',
          body: 'The prescription was created but not turned into an order.',
          status: 'info'
        });
        setIsCombiningOrders(false);
        return;
      }
    }
  };

  return (
    <Dialog
      open={state.isCombineDialogOpen}
      onClose={() => {
        dispatchDatadogAction('prescribe-combine-dialog-exit', {}, ref);
        actions.setIsCombineDialogOpen(false);
      }}
    >
      <div class="flex flex-col gap-6" ref={ref}>
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
                    <Text size="sm">{fill?.treatment?.name}</Text>
                    <br />
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
              TODO TODO TODO
              {/* <For each={state.draftPrescriptions}>
                {(draft) => (
                  <div>
                    <Text size="sm">{draft.treatment.name}</Text>
                    <br />
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
              </For> */}
            </div>
          </div>
        </div>

        <div class="flex flex-col items-stretch gap-2">
          <Button
            size="xl"
            onClick={combineOrders}
            disabled={isCreatingOrder() || isCombiningOrders()}
            loading={isCreatingOrder() || isCombiningOrders()}
          >
            Yes, combine orders
          </Button>
          <Button
            variant="secondary"
            size="xl"
            onClick={() => {
              dispatchDatadogAction('prescribe-combine-dialog-not-combining', {}, ref);
              state.createOrder?.();
              setIsCreatingOrder(true);
            }}
            disabled={isCreatingOrder() || isCombiningOrders()}
            loading={isCreatingOrder() || isCombiningOrders()}
          >
            {isCreatingOrder() ? 'Creating order...' : 'No, send new order'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
