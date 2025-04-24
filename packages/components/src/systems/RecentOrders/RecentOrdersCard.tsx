import { For, Show } from 'solid-js';
import { useRecentOrders } from '.';
import formatDate from '../../utils/formatDate';
import Banner from '../../particles/Banner';
import Button from '../../particles/Button';
import Card from '../../particles/Card';
import Text from '../../particles/Text';
import { OrderStatusBadge } from '../../particles/OrderStatusBadge';

export default function RecentOrdersCard() {
  const [state, actions] = useRecentOrders();

  return (
    <Show when={state.orders.length > 0}>
      <Card addChildrenDivider={true}>
        <div class="flex items-center justify-between">
          <Text color="gray">Recent Orders</Text>
        </div>
        <table class="table-fixed divide-y divide-gray-300 break-words">
          <tbody class="divide-y divide-gray-200">
            <For each={state.orders}>
              {(order) => {
                const treatments = new Set<string>();
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
                            {(treatment, index) => {
                              return (
                                <Text color="black" size="sm">
                                  {treatment}
                                  {index() < treatments.size - 1 ? ', \u00A0' : null}
                                </Text>
                              );
                            }}
                          </For>
                        </div>
                      </div>
                      <Show when={order.state === 'ROUTING'}>
                        <div class="mt-4">
                          <Banner status="info" withoutIcon>
                            <div class="flex flex-col gap-2">
                              <Text size="sm" color="black">
                                This order is pending pharmacy selection by the patient
                              </Text>
                              <div class="flex gap-x-4">
                                <Button
                                  variant="naked"
                                  onClick={() => actions.setIsIssueDialogOpen(true, order)}
                                >
                                  Report Issue
                                </Button>
                              </div>
                            </div>
                          </Banner>
                        </div>
                      </Show>
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
