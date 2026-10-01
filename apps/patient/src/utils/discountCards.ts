import { Order } from './models';

// The discount card for the order's current pharmacy, if it has everything needed to use it.
// A rerouted order can still carry cards from its previous pharmacy, so those are skipped.
export const getCurrentDiscountCard = (order: Order) => {
  const card = order.discountCards?.find((c) => c.pharmacyId === order.pharmacy?.id);
  if (!card) return undefined;

  const { price, bin, pcn, group, memberId } = card;
  if (!price || !bin || !pcn || !group || !memberId) return undefined;

  return card;
};
