import { createMemo, Show } from 'solid-js';
// forgive me, ripped from clinical app and solid(js)ified it
import { OrderState } from '@photonhealth/sdk/dist/types';
import Badge, { BadgeColor } from '../Badge';
import Icon, { IconName } from '../Icon';
import Tooltip from '../Tooltip';

export type OrderFulfillmentState =
  | 'SENT'
  // Pick Up
  | 'RECEIVED'
  | 'READY'
  | 'PICKED_UP'
  // Mail Order
  | 'FILLING'
  | 'SHIPPED'
  | 'DELIVERED';
type OrderFulfillmentRecord = Record<OrderFulfillmentState, string>;

export const ORDER_STATE_MAP: { [key in OrderState]: string } = {
  PLACED: 'Placed',
  ROUTING: 'Routing',
  PENDING: 'Pending',
  CANCELED: 'Canceled',
  COMPLETED: 'Completed',
  ERROR: 'Error'
};

export const ORDER_STATE_ICON_MAP: { [key in OrderState]: IconName } = {
  PLACED: 'arrowUpRight',
  ROUTING: 'arrowUturnRight',
  PENDING: 'clock',
  CANCELED: 'xCircle',
  COMPLETED: 'checkCircle',
  ERROR: 'questionMarkCircle'
};

export const ORDER_FULFILLMENT_STATE_MAP: OrderFulfillmentRecord = {
  SENT: 'Sent',
  RECEIVED: 'Received',
  READY: 'Ready',
  PICKED_UP: 'Picked up',
  FILLING: 'Filling',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered'
};

export const ORDER_FULFILLMENT_COLOR_MAP: OrderFulfillmentRecord = {
  SENT: 'yellow',
  RECEIVED: 'orange',
  READY: 'green',
  PICKED_UP: 'green',
  FILLING: 'orange',
  SHIPPED: 'green',
  DELIVERED: 'gray'
};

export const ORDER_FULFILLMENT_TIP_MAP: OrderFulfillmentRecord = {
  SENT: 'Order sent to pharmacy',
  RECEIVED: 'Order received by pharmacy',
  READY: 'Order ready at pharmacy',
  PICKED_UP: 'Order picked up by patient',
  FILLING: 'Mail order being filled',
  SHIPPED: 'Mail order shipped',
  DELIVERED: 'Mail order delivered'
};

export const ORDER_STATE_TIP_MAP: { [key in OrderState]: string } = {
  PLACED: 'Order has been placed',
  ROUTING: 'Order waiting on patient pharmacy selection',
  PENDING: 'Order is pending',
  CANCELED: 'Order has been canceled',
  COMPLETED: 'Order has been completed',
  ERROR: 'Order has an error'
};

export const ORDER_STATE_COLOR_MAP: { [key in OrderState]: BadgeColor } = {
  ERROR: 'red',
  CANCELED: 'red',
  ROUTING: 'gray',
  PLACED: 'yellow',
  PENDING: 'yellow',
  COMPLETED: 'green'
};

export const ORDER_FULFILLMENT_STATE_COLOR_MAP: { [key in OrderFulfillmentState]: BadgeColor } = {
  SENT: 'yellow',
  RECEIVED: 'yellow',
  FILLING: 'yellow',
  SHIPPED: 'yellow',
  READY: 'green',
  PICKED_UP: 'green',
  DELIVERED: 'green'
};

// I'd never seen this, but to get the values of an enum https://stackoverflow.com/a/75722379
export type OrderStateString = `${OrderState}`;

export interface OrderStatusBadgeProps {
  fulfillmentState?: OrderFulfillmentState;
  orderState: OrderStateString;
}

export function OrderStatusBadge(props: OrderStatusBadgeProps) {
  const renderProps = createMemo(() => {
    if (props.orderState === 'PLACED' && props.fulfillmentState) {
      const key = props.fulfillmentState;
      return {
        status: ORDER_FULFILLMENT_STATE_MAP[key],
        statusColor: ORDER_FULFILLMENT_STATE_COLOR_MAP[key],
        statusTip: ORDER_FULFILLMENT_TIP_MAP[key]
      };
    } else {
      const key = props.orderState as OrderState;
      return {
        status: ORDER_STATE_MAP[key],
        statusTip: ORDER_STATE_TIP_MAP[key],
        statusIcon: ORDER_STATE_ICON_MAP[key],
        statusColor: ORDER_STATE_COLOR_MAP[key]
      };
    }
  });

  return (
    <Show when={renderProps().status}>
      <Tooltip text={renderProps().statusTip}>
        <Badge color={renderProps().statusColor}>
          <Show when={renderProps().statusIcon}>
            <div class="mr-1">
              <Icon name={renderProps().statusIcon} size="sm" />
            </div>
          </Show>
          {renderProps().status}
        </Badge>
      </Tooltip>
    </Show>
  );
}
