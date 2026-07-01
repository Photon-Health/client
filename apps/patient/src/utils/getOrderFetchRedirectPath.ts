import { FulfillmentType } from 'packages/sdk/src/types';
import { Order } from './models';

export type OrderFetchRedirectPath = '/canceled' | '/pharmacy' | '/status' | '/review';

export const hasSingleAutoRouteWithNoReroutes = (order: Order): boolean => {
  const routingHistory = order.metadata?.routingHistory ?? [];
  return routingHistory.length === 1 && routingHistory[0]?.selector === 'AUTO';
};

const hasSingleProviderRouteWithNoReroutes = (order: Order): boolean => {
  const routingHistory = order.metadata?.routingHistory ?? [];
  return routingHistory.length === 1 && routingHistory[0]?.selector === 'PROVIDER';
};

// We don't want to redirect to the Marketplace immediately for Mail-In Pharmacies
// For now it's just a confusing experience, once we redesign the experience we should remove this.
const isOrderMailIn = (order: Order): boolean => {
  return (
    order.pharmacy?.fulfillmentTypes?.every(
      (fulfillmentType) => fulfillmentType === FulfillmentType.MailOrder
    ) ?? false
  );
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
    const shouldConfirmAutoRoutedPharmacy =
      (hasSingleAutoRouteWithNoReroutes(order) || hasSingleProviderRouteWithNoReroutes(order)) &&
      // When Mail-In is pre-chosen the Market Place UI is really confusing
      !isOrderMailIn(order) &&
      // We don't want to show the marketplace for Compound Treatments
      !isForCompoundMed(order) &&
      order.isReroutable &&
      !options.hasConfirmedAutoroutedPharmacy;
    return shouldConfirmAutoRoutedPharmacy ? '/pharmacy' : '/status';
  }

  if (order.patient.address) {
    return '/pharmacy';
  }

  return '/review';
};
