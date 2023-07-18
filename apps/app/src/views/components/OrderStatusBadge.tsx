import { Tag, TagLabel, TagLeftIcon, Tooltip } from '@chakra-ui/react';
import { OrderState } from 'packages/sdk/dist/types';
import {
  FiAlertTriangle,
  FiArrowUpRight,
  FiCheck,
  FiClock,
  FiCornerUpRight,
  FiX
} from 'react-icons/fi';

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
  PLACED: FiArrowUpRight,
  ROUTING: FiCornerUpRight,
  PENDING: FiClock,
  CANCELED: FiX,
  COMPLETED: FiCheck,
  ERROR: FiAlertTriangle
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

interface OrderStatusBadgeProps {
  fulfillmentState?: OrderFulfillmentState;
  orderState?: OrderState;
}

function OrderStatusBadge({ fulfillmentState, orderState }: OrderStatusBadgeProps) {
  let status = '';
  let statusColor = 'gray';
  let statusTip = '';
  let statusIcon;

  if (!fulfillmentState && !orderState) {
    return null;
  }

  if (fulfillmentState) {
    const key = fulfillmentState;
    status = ORDER_FULFILLMENT_STATE_MAP[key];
    statusTip = ORDER_FULFILLMENT_TIP_MAP[key] || status;
    statusColor = ORDER_FULFILLMENT_COLOR_MAP[key] || statusColor;
  } else {
    const key = orderState as OrderState;
    status = ORDER_STATE_MAP[key];
    statusTip = 'Order waiting on patient pharmacy selection';
    statusIcon = ORDER_STATE_ICON_MAP[key];
  }

  return (
    <Tooltip label={statusTip}>
      <Tag size="sm" borderRadius="full" colorScheme={statusColor}>
        {statusIcon ? <TagLeftIcon boxSize="12px" as={statusIcon} /> : null}
        <TagLabel>{status}</TagLabel>
      </Tag>
    </Tooltip>
  );
}

export default OrderStatusBadge;
