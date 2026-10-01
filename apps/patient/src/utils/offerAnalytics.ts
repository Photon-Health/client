import { OfferPriceType } from '../__generated__/graphql';
import { EnrichedPharmacy, PharmacyOffer, PharmacyOfferGroup, OfferTypes } from './models';
import { OFFER_SOURCE } from './offers';

// mapping from Offer or Pharmacy source to `offerType` for analytics
export function getOfferType({
  pharmacy,
  offer
}: {
  pharmacy?: EnrichedPharmacy;
  offer?: PharmacyOffer;
}) {
  if (offer?.source === OFFER_SOURCE.AMAZON_PHARMACY) return OfferTypes.AmazonPharmacy;
  else if (offer?.source === OFFER_SOURCE.NOVOCARE) return OfferTypes.Novocare;
  else if (offer?.source === OFFER_SOURCE.UK_HEALTH) return OfferTypes.UkHealth;
  else if (offer?.source === OFFER_SOURCE.ARRIVE) return OfferTypes.Arrive;
  else if (pharmacy?.source === 'goodrx') return OfferTypes.GoodRx;
  else if (pharmacy?.source === 'rxsense') return OfferTypes.RxSense;
  return null;
}

// Analytics-only cost-type label, derived from prices across offers:
// a multi-price-type total is `'MIXED'`, else the single price type.
export function deriveCostType(offer: PharmacyOffer): OfferPriceType | 'MIXED' | undefined {
  const priceTypes = [
    ...new Set((offer.prescriptions ?? []).map((med) => med.pricingType).filter(Boolean))
  ];
  if (priceTypes.length > 1) {
    return 'MIXED';
  }
  return priceTypes[0] as OfferPriceType | undefined;
}

// every price the patient could have chosen at this pharmacy, named the way offerType names them
export function toWaysToPay({
  pharmacy,
  offerGroup
}: {
  pharmacy?: EnrichedPharmacy;
  offerGroup?: PharmacyOfferGroup;
}): Array<{ source: string | null; price?: number }> {
  const couponSource = getOfferType({ pharmacy });

  return [
    ...(offerGroup?.offers ?? []).map((offer) => ({
      source: getOfferType({ offer }),
      price: offer.pricing.costAmount
    })),
    // The pharmacy's own coupon price, until coupons are offers too. Only a pharmacy whose source
    // we can name has one — an offer-derived pharmacy carries its offer's price, not a coupon.
    ...(pharmacy?.price != null && couponSource
      ? [{ source: couponSource, price: pharmacy.price }]
      : [])
  ];
}
