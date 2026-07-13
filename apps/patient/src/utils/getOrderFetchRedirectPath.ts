import { Order } from './models';

export type OrderFetchRedirectPath = '/canceled' | '/pharmacy' | '/status' | '/review';

export const hasSingleAutoRouteWithNoReroutes = (order: Order): boolean => {
  const routingHistory = order.metadata?.routingHistory ?? [];
  return routingHistory.length === 1 && routingHistory[0]?.selector === 'AUTO';
};

export const hasSingleProviderRouteWithNoReroutes = (order: Order): boolean => {
  const routingHistory = order.metadata?.routingHistory ?? [];
  return routingHistory.length === 1 && routingHistory[0]?.selector === 'PROVIDER';
};

const isForCompoundMed = (order: Order): boolean => {
  return order.fills.some((f) => f.treatment.__typename === 'Compound');
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
    const shouldShowMarketplace =
      (hasSingleAutoRouteWithNoReroutes(order) || hasSingleProviderRouteWithNoReroutes(order)) &&
      // We don't want to show the marketplace for Compound Treatments
      !isForCompoundMed(order) &&
      order.isReroutable &&
      !options.hasConfirmedAutoroutedPharmacy;
    return shouldShowMarketplace ? '/pharmacy' : '/status';
  }

  if (order.patient.address) {
    return '/pharmacy';
  }

  return '/review';
};
