import { PharmacyOffer } from './models';
import { OFFER_SOURCE } from './offers';

// promoted offers don't have rank (yet) so we enforce that here for now
const CLIENT_SOURCE_PRIORITY: string[] = [OFFER_SOURCE.AMAZON_PHARMACY, OFFER_SOURCE.NOVOCARE];

function sourceRank(offer: PharmacyOffer): number {
  const index = CLIENT_SOURCE_PRIORITY.indexOf(offer.source ?? '');
  return index === -1 ? CLIENT_SOURCE_PRIORITY.length : index;
}

export function isDeliveryOffer(offer: PharmacyOffer): boolean {
  // fulfillment types is an array but we're assuming a single type per pharmacy
  return (offer.pharmacy.fulfillmentTypes ?? []).includes('MAIL_ORDER');
}

export interface OfferPlacement {
  aboveFold: PharmacyOffer[]; // promoted offers, source-priority ordered
  inTab: PharmacyOffer[]; // the rest fall into their respective tabs
}

export function selectOfferPlacement(allOffers: PharmacyOffer[] | undefined): OfferPlacement {
  const offers = allOffers ?? [];

  // when there are multiple UK health offers, show all promoted offers at the top of their respective tabs
  const hasManyUkHealthOffers =
    offers.filter((offer) => offer.isPromoted && offer.source === OFFER_SOURCE.UK_HEALTH).length >
    1;

  const isAboveFold = (offer: PharmacyOffer) => !!offer.isPromoted && !hasManyUkHealthOffers;

  return {
    aboveFold: offers.filter(isAboveFold).sort((a, b) => sourceRank(a) - sourceRank(b)),
    inTab: offers.filter((offer) => !isAboveFold(offer))
  };
}
