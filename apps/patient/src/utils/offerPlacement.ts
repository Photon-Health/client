import { OfferBundleComplete } from './models';
import { OFFER_SOURCE } from './offers';

// promoted offers don't have rank (yet) so we enforce that here for now
const CLIENT_SOURCE_PRIORITY: string[] = [OFFER_SOURCE.AMAZON_PHARMACY, OFFER_SOURCE.NOVOCARE];

function sourceRank(offer: OfferBundleComplete): number {
  const index = CLIENT_SOURCE_PRIORITY.indexOf(offer.source ?? '');
  return index === -1 ? CLIENT_SOURCE_PRIORITY.length : index;
}

export function isDeliveryOffer(offer: OfferBundleComplete): boolean {
  // fulfillment types is an array but we're assuming a single type per pharmacy
  return (offer.pharmacy.fulfillmentTypes ?? []).includes('MAIL_ORDER');
}

export interface OfferPlacement {
  aboveFold: OfferBundleComplete[]; // all promoted offers, source-priority ordered
  inTab: OfferBundleComplete[]; // the rest fall into their respective tabs
}

export function selectOfferPlacement(allOffers: OfferBundleComplete[] | undefined): OfferPlacement {
  return {
    aboveFold: (allOffers ?? [])
      .filter((offer) => offer.isPromoted)
      .sort((a, b) => sourceRank(a) - sourceRank(b)),
    inTab: (allOffers ?? []).filter((offer) => !offer.isPromoted)
  };
}
