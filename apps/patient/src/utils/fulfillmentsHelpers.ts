import { PrescriptionFulfillment } from '../__generated__/graphql';
import { Fulfillment, OrderFulfillment } from './models';
export function getLatestReadyTime(
  fulfillments: Pick<PrescriptionFulfillment, 'pharmacyEstimatedReadyAt'>[]
) {
  return fulfillments.reduce(
    (time: Date | undefined, f) =>
      time == null || f.pharmacyEstimatedReadyAt == null
        ? undefined
        : f.pharmacyEstimatedReadyAt > time
        ? f.pharmacyEstimatedReadyAt
        : time,
    fulfillments[0].pharmacyEstimatedReadyAt
  );
}

const fulfillmentStatuses = Object.fromEntries(
  (
    [
      'DELAYED',
      'CREATED',
      'SENT',
      'RECEIVED',
      'PROCESSING',
      'READY',
      'PICKED_UP',
      'DELIVERED'
    ] as const
  ).map((s, i) => [s, i])
) as { [state in PrescriptionFulfillment['state'] | 'DELAYED']: number };

export function deriveOrderStatus(fulfillments: Fulfillment[]): keyof typeof fulfillmentStatuses {
  return fulfillments.reduce<keyof typeof fulfillmentStatuses>(
    (s, f): keyof typeof fulfillmentStatuses =>
      f.exceptions.length > 0
        ? 'DELAYED'
        : fulfillmentStatuses[f.state] > fulfillmentStatuses[s]
        ? s
        : f.state,
    'DELIVERED'
  );
}

export function getFulfillmentTrackingLink(fulfillment: OrderFulfillment) {
  const missingTrackingInfo = !fulfillment.carrier || !fulfillment.trackingNumber;
  if (fulfillment.type !== 'MAIL_ORDER' || missingTrackingInfo) return;

  const searchQuery = encodeURIComponent(`${fulfillment.carrier} ${fulfillment.trackingNumber}`);
  return `https://google.com/search?q=${searchQuery}`;
}
