import { Order } from './models';

// CVS no longer accepts GoodRx coupons. RxSense coupons are still accepted there.
const isCvs = (pharmacyName?: string | null) => /\bcvs\b/i.test(pharmacyName ?? '');

export const pharmacyAcceptsCoupon = ({
  pharmacyName,
  source
}: {
  pharmacyName?: string | null;
  source?: string | null;
}) => !(source === 'goodrx' && isCvs(pharmacyName));

// Drops the coupon price from a pharmacy search result when that pharmacy won't accept the coupon
export const withoutUnacceptedCouponPrice = <
  T extends {
    name: string;
    price?: number | null;
    retailPrice?: number | null;
    source?: string | null;
  }
>(
  pharmacy: T
): T =>
  pharmacyAcceptsCoupon({ pharmacyName: pharmacy.name, source: pharmacy.source })
    ? pharmacy
    : { ...pharmacy, price: null, retailPrice: null, source: null };

// The discount card for the order's current pharmacy, if it has everything needed to use it.
// A rerouted order can still carry cards from its previous pharmacy, so those are skipped.
export const getCurrentDiscountCard = (order: Order) => {
  const card = order.discountCards?.find((c) => c.pharmacyId === order.pharmacy?.id);
  if (!card) return undefined;

  const { price, bin, pcn, group, memberId } = card;
  if (!price || !bin || !pcn || !group || !memberId) return undefined;

  if (!pharmacyAcceptsCoupon({ pharmacyName: order.pharmacy?.name, source: card.source })) {
    return undefined;
  }

  return card;
};
