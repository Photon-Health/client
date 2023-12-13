// forgive me, ripped from clinical app and solid(js)ified it
import { OrderState } from 'packages/sdk/dist/types';
import Badge, { BadgeColor } from '../Badge';
import Icon from '../Icon';
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

export const ORDER_STATE_ICON_MAP: any = {
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
  PLACED: 'yellow',
  ROUTING: 'gray',
  PENDING: 'yellow',
  CANCELED: 'red',
  COMPLETED: 'green',
  ERROR: 'red'
};

interface OrderStatusBadgeProps {
  fulfillmentState?: OrderFulfillmentState;
  orderState?: OrderState;
}

function OrderStatusBadge(props: OrderStatusBadgeProps) {
  let status = '';
  let statusColor: BadgeColor = 'gray';
  let statusTip = '';
  let statusIcon;

  if (!props.fulfillmentState && !props.orderState) {
    return null;
  }

  if (props.orderState === 'PLACED' && props.fulfillmentState) {
    const key = props.fulfillmentState;
    status = ORDER_FULFILLMENT_STATE_MAP[key];
    statusTip = ORDER_FULFILLMENT_TIP_MAP[key] || status;
    statusColor = (ORDER_FULFILLMENT_COLOR_MAP[key] as BadgeColor) || statusColor;
  } else {
    const key = props.orderState as OrderState;
    status = ORDER_STATE_MAP[key];
    statusTip = ORDER_STATE_TIP_MAP[key] || status;
    statusIcon = ORDER_STATE_ICON_MAP[key];
    statusColor = ORDER_STATE_COLOR_MAP[key] || statusColor;
  }

  return (
    <Tooltip text={statusTip}>
      <Badge color={statusColor}>
        <div class="mr-1">
          <Icon name={statusIcon} size="sm" />
        </div>
        {status}
      </Badge>
    </Tooltip>
  );
}

export default OrderStatusBadge;
