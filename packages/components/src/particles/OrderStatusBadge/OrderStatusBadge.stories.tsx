import {
  OrderStatusBadge,
  OrderStatusBadgeProps,
  OrderStateString,
  OrderFulfillmentState
} from './OrderStatusBadge';
import type { Meta, StoryObj } from '@storybook/html';
import type { ComponentProps } from 'solid-js';
import { For } from 'solid-js/web';

type OrderStatusBadgeStory = StoryObj<OrderStatusBadgeProps>;

const meta: Meta<ComponentProps<typeof OrderStatusBadge>> = {
  title: 'OrderStatusBadge',
  // @ts-ignore
  component: OrderStatusBadge,
  tags: ['autodocs'],
  argTypes: {}
};

export default meta;

const orderStates: OrderStateString[] = [
  'PLACED',
  'ROUTING',
  'PENDING',
  'CANCELED',
  'COMPLETED',
  'ERROR'
];
const fulfillmentStates: OrderFulfillmentState[] = [
  'SENT',
  'RECEIVED',
  'READY',
  'PICKED_UP',
  'FILLING',
  'SHIPPED',
  'DELIVERED'
];

export const Default: OrderStatusBadgeStory = {
  // @ts-ignore
  render: () => (
    <>
      <div class="text-xs mb-8 font-mono">ORDER_STATE / FULFILLMENT_STATE</div>
      <For each={orderStates}>
        {(orderState) => (
          <div class="flex mb-4 gap-4">
            <For each={[...fulfillmentStates, undefined]}>
              {(fulfillmentState) => (
                <div class="mb-2">
                  <OrderStatusBadge orderState={orderState} fulfillmentState={fulfillmentState} />
                  <span class="text-xs font-mono">
                    {' '}
                    {orderState} / {fulfillmentState || 'undefined'}
                  </span>
                </div>
              )}
            </For>
          </div>
        )}
      </For>
    </>
  )
};
