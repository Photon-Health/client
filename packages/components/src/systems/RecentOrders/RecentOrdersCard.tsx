import { For, Show } from 'solid-js';
import { useRecentOrders } from '.';
import Card from '../../particles/Card';

export default function RecentOrdersCard() {
  const { orders } = useRecentOrders();

  return (
    <Show when={orders().length > 0}>
      <Card>
        Recent Orders
        <For each={orders()}>{(order) => <div>{order.id}</div>}</For>
      </Card>
    </Show>
  );
}
