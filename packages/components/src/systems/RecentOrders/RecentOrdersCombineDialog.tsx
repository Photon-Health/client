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
import { Address } from '../PatientInfo';
import { createMutation } from '../../utils/createMutation';
import { Order } from '@photonhealth/sdk/dist/types';
import { useDraftPrescriptions } from '../DraftPrescriptions';
import { usePrescribeEventDispatch } from '../PrescribeEventDispatchProvider';

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
    $addressId: ID
    $address: AddressInput
  ) {
    createOrder(patientId: $patientId, fills: $fills, addressId: $addressId, address: $address) {
      id
    }
  }
`;

type SuccessResponse = {
  id: string;
};

type SuccessCombineOrders = { updateOrder: SuccessResponse };
type VariablesCombineOrders = { orderId: string; fills: { prescriptionId: string }[] };

type SuccessCreateOrder = { createOrder: SuccessResponse };
type VariablesCreateOrder = {
  patientId: string;
  fills: { prescriptionId: string }[];
  addressId?: string;
  address?: Address;
};

export default function RecentOrdersCombineDialog() {
  const { draftPrescriptions, setDraftPrescriptions } = useDraftPrescriptions();
  const { dispatchOrderCreated, dispatchOrderCombined, dispatchAnalyticsTrackEvent } =
    usePrescribeEventDispatch();

  const client = usePhotonClient();
  const [state, actions] = useRecentOrders();
  const [isCreatingOrder, setIsCreatingOrder] = createSignal(false);
  const [isCombiningOrders, setIsCombiningOrders] = createSignal(false);

  const [combineOrdersMutation] = createMutation<SuccessCombineOrders, VariablesCombineOrders>(
    COMBINE_ORDERS_MUTATION,
    {
      client: client.apollo
    }
  );

  const [createOrderMutation] = createMutation<SuccessCreateOrder, VariablesCreateOrder>(
    CREATE_ORDER_MUTATION,
    {
      client: client.apollo
    }
  );

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

  const onCombineOrdersClick = async () => {
    const order = routingOrder();

    if (!order) {
      return;
    }

    setIsCombiningOrders(true);
    dispatchAnalyticsTrackEvent('ctaClicked', {
      name: 'Combine Orders Confirmed',
      buttonText: 'Yes, combine orders'
    });

    const fills = draftPrescriptions().map((prescription) => ({ prescriptionId: prescription.id }));
    try {
      // Add rxs to the existing order
      const updatedOrder = await combineOrdersMutation({
        variables: { orderId: order.id, fills }
      });

      // Trigger message to redirect to order page
      dispatchOrderCombined(updatedOrder.updateOrder as Order);
      dispatchAnalyticsTrackEvent('ctaClicked', {
        name: 'Order Sent',
        buttonText: 'Send',
        orderId: order.id,
        prescriptionCount: draftPrescriptions().length,
        fulfillmentType: null,
        hasPreferredPharmacy: false,
        setAsPreferred: false,
        pharmacyId: null,
        isCombinedOrder: true
      });

      setIsCombiningOrders(false);
      // The fills now live on the combined order. Clear the drafts so embed
      // hosts that don't handle photon-order-combined (and therefore never
      // unmount this workflow) can't resubmit the same prescriptions.
      setDraftPrescriptions([]);
      actions.setIsCombineDialogOpen(false);
      return;
    } catch {
      // if there is an error updating an order, most likely because the order state has
      // changed since it was first fetched so we need to create a new order
      try {
        if ((!state?.addressId && !state?.address) || !state?.patientId) {
          throw new Error('No address provided');
        }

        const newOrder = await createOrderMutation({
          variables: {
            patientId: state.patientId,
            fills,
            ...(state.addressId ? { addressId: state.addressId } : { address: state.address })
          }
        });

        dispatchOrderCreated(newOrder.createOrder as Order);
        dispatchAnalyticsTrackEvent('ctaClicked', {
          name: 'Order Sent',
          buttonText: 'Send',
          orderId: newOrder.createOrder.id,
          prescriptionCount: draftPrescriptions().length,
          fulfillmentType: 'SEND_TO_PATIENT',
          hasPreferredPharmacy: false,
          setAsPreferred: false,
          pharmacyId: null,
          isCombinedOrder: false
        });
        setIsCombiningOrders(false);
        setDraftPrescriptions([]);
        actions.setIsCombineDialogOpen(false);
      } catch {
        triggerToast({
          header: 'Error Creating Order',
          body: 'The draft was created but not turned into an active prescription.',
          status: 'info'
        });
        setIsCombiningOrders(false);
        // Close the dialog rather than leaving the button re-enabled: every
        // additional click here re-sends the same failing mutations
        actions.setIsCombineDialogOpen(false);
        return;
      }
    }
  };

  return (
    <Dialog
      open={state.isCombineDialogOpen}
      onClose={() => {
        actions.setIsCombineDialogOpen(false);
      }}
    >
      <div class="flex flex-col gap-6">
        <div>
          <div class="table bg-blue-50 text-blue-600 p-2 rounded-full mb-4">
            <Icon name="exclamationCircle" />
          </div>
          <Text bold>Add prescription to recent order?</Text>
        </div>

        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <Text>This patient currently has prescriptions for:</Text>
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
              {
                <For each={draftPrescriptions()}>
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
                </For>
              }
            </div>
          </div>
        </div>

        <div class="flex flex-col items-stretch gap-2">
          <Button
            size="xl"
            onClick={onCombineOrdersClick}
            disabled={isCreatingOrder() || isCombiningOrders()}
            loading={isCombiningOrders()}
          >
            Yes, combine orders
          </Button>
          <Button
            variant="secondary"
            size="xl"
            onClick={() => {
              dispatchAnalyticsTrackEvent('ctaClicked', {
                name: 'Combine Orders Rejected',
                buttonText: 'No, send new order'
              });
              state.createOrder?.();
              setIsCreatingOrder(true);
            }}
            disabled={isCreatingOrder() || isCombiningOrders()}
            loading={isCreatingOrder()}
          >
            {isCreatingOrder() ? 'Creating order...' : 'No, send new order'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
