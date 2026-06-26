import { Order } from './models';

export type OrderFetchRedirectPath = '/canceled' | '/pharmacy' | '/status' | '/review';

export const hasSingleAutoRouteWithNoReroutes = (order: Order): boolean => {
  const routingHistory = order.metadata?.routingHistory ?? [];
  return routingHistory.length === 1 && routingHistory[0]?.selector === 'AUTO';
};

type OrderFetchRedirectOptions = {
  hasConfirmedAutoroutedPharmacy?: boolean;
};

export const getOrderFetchRedirectPath = (
  order: Order,
  options: OrderFetchRedirectOptions = {}
): OrderFetchRedirectPath => {
  if (order.state === 'CANCELED') {
    return '/canceled';
  }

  if (order.pharmacy?.id) {
    const shouldConfirmAutoRoutedPharmacy =
      hasSingleAutoRouteWithNoReroutes(order) &&
      order.isReroutable &&
      !options.hasConfirmedAutoroutedPharmacy;
    return shouldConfirmAutoRoutedPharmacy ? '/pharmacy' : '/status';
  }

  if (order.patient.address) {
    return '/pharmacy';
  }

  return '/review';
};
