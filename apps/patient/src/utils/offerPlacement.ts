import { PharmacyOffer, PharmacyOfferGroup } from './models';
import { CLIENT_SOURCE_PRIORITY, OFFER_SOURCE, groupOffersByPharmacy } from './offers';

// a group ranks by its best-ranked source
function sourceRank(group: PharmacyOfferGroup): number {
  return Math.min(
    ...group.offers.map((offer) => {
      const index = CLIENT_SOURCE_PRIORITY.indexOf(offer.source ?? '');
      return index === -1 ? CLIENT_SOURCE_PRIORITY.length : index;
    })
  );
}

export function isDeliveryOffer({ pharmacy }: Pick<PharmacyOffer, 'pharmacy'>): boolean {
  // fulfillment types is an array but we're assuming a single type per pharmacy
  return (pharmacy.fulfillmentTypes ?? []).includes('MAIL_ORDER');
}

export interface OfferPlacement {
  aboveFold: PharmacyOfferGroup[]; // promoted pharmacies, source-priority ordered
  inTab: PharmacyOfferGroup[]; // the rest fall into their respective tabs
}

export function selectOfferPlacement(allOffers: PharmacyOffer[] | undefined): OfferPlacement {
  const groups = groupOffersByPharmacy(allOffers ?? []);

  // when there are multiple UK health offers, show all promoted offers at the top of their respective tabs
  const hasManyUkHealthOffers =
    groups.filter((group) =>
      group.offers.some((offer) => offer.isPromoted && offer.source === OFFER_SOURCE.UK_HEALTH)
    ).length > 1;

  // any promoted offer promotes the whole pharmacy card
  const isAboveFold = (group: PharmacyOfferGroup) =>
    group.offers.some((offer) => offer.isPromoted) && !hasManyUkHealthOffers;

  return {
    aboveFold: groups.filter(isAboveFold).sort((a, b) => sourceRank(a) - sourceRank(b)),
    inTab: groups.filter((group) => !isAboveFold(group))
  };
}
