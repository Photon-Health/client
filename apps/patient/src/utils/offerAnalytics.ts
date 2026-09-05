import { OfferPriceType } from '../__generated__/graphql';
import { EnrichedPharmacy, OfferBundleComplete, OfferTypes } from './models';
import { OFFER_SOURCE } from './offers';

// mapping from Offer or Pharmacy source to `offerType` for analytics
export function getOfferType({
  pharmacy,
  offer
}: {
  pharmacy?: EnrichedPharmacy;
  offer?: OfferBundleComplete;
}) {
  if (offer?.source === OFFER_SOURCE.AMAZON_PHARMACY) return OfferTypes.AmazonPharmacy;
  else if (offer?.source === OFFER_SOURCE.NOVOCARE) return OfferTypes.Novocare;
  else if (pharmacy?.source === 'goodrx') return OfferTypes.GoodRx;
  else if (pharmacy?.source === 'rxsense') return OfferTypes.RxSense;
  return null;
}

// Analytics-only cost-type label, derived from prices across offers:
// a multi-price-type total is `'MIXED'`, else the single price type.
export function deriveCostType(offer: OfferBundleComplete): OfferPriceType | 'MIXED' | undefined {
  const priceTypes = [
    ...new Set((offer.medications ?? []).map((med) => med.pricingType).filter(Boolean))
  ];
  if (priceTypes.length > 1) {
    return 'MIXED';
  }
  return priceTypes[0] as OfferPriceType | undefined;
}
