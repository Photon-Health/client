import { Order } from './models';

export type OrderFetchRedirectPath = '/canceled' | '/pharmacy' | '/status' | '/review';

const hasSingleAutoRouteWithNoReroutes = (order: Order): boolean => {
  const routingHistory = order.metadata?.routingHistory ?? [];
  return routingHistory.length === 1 && routingHistory[0]?.selector === 'AUTO';
};

/**
 * after the initial order fetch, send the patient to the first step they still need.
 *
 * pharmacy assigned + sole AUTO route + reroutable → pharmacy
 * pharmacy assigned otherwise                      → status
 * no pharmacy + patient address                    → pharmacy
 * no pharmacy + no address                         → review
 */
export const getOrderFetchRedirectPath = (order: Order): OrderFetchRedirectPath => {
  if (order.state === 'CANCELED') {
    return '/canceled';
  }

  if (order.pharmacy?.id) {
    const shouldConfirmAutoRoutedPharmacy =
      hasSingleAutoRouteWithNoReroutes(order) && order.isReroutable;
    return shouldConfirmAutoRoutedPharmacy ? '/pharmacy' : '/status';
  }

  if (order.patient.address) {
    return '/pharmacy';
  }

  return '/review';
};
