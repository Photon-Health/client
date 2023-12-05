import { For, Show } from 'solid-js';
import { useRecentOrders } from '.';
import formatDate from '../../utils/formatDate';
import Card from '../../particles/Card';
import Text from '../../particles/Text';
import Banner from '../../particles/Banner';
import OrderStatusBadge from '../../particles/OrderStatusBadge';

export default function RecentOrdersCard() {
  // TODO fix type error
  const { orders } = useRecentOrders();

  return (
    <Show when={orders().length > 0}>
      <Card>
        <div class="flex items-center justify-between">
          <Text color="gray">Recent Orders</Text>
        </div>
        <table class="table-fixed divide-y divide-gray-300 break-words">
          <tbody class="divide-y divide-gray-200">
            <For each={orders()}>
              {(order) => {
                const treatments = new Set<string>();
                // TODO fix type error
                order?.fills.forEach((fill) => {
                  treatments.add(fill.treatment?.name);
                });

                return (
                  <tr>
                    <td class="align-top whitespace-nowrap pr-4 py-4 text-sm text-gray-500">
                      <Text color="gray" size="sm">
                        {formatDate(order.createdAt)}
                      </Text>
                    </td>
                    <td class="py-4 text-sm text-gray-500">
                      <div class="flex">
                        <div class="pr-4">
                          <OrderStatusBadge orderState={order.state} />
                        </div>
                        <div>
                          <For each={[...treatments]}>
                            {(treatment) => (
                              <Text color="black" size="sm">
                                {treatment}
                              </Text>
                            )}
                          </For>
                        </div>
                      </div>
                      <div class="mt-4">
                        <Banner text="This order is being processed" status="info" />
                      </div>
                    </td>
                  </tr>
                );
              }}
            </For>
          </tbody>
        </table>
      </Card>
    </Show>
  );
}
