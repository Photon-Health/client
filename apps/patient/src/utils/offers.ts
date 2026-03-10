import { OfferDetails } from './models';
import { EnrichedPharmacy, OfferType, OfferTypes } from './models';

export function getOfferType({
  pharmacy,
  offer
}: {
  pharmacy?: EnrichedPharmacy;
  offer?: OfferDetails;
}) {
  let offerType: OfferType | null = null;
  if (offer?.costType) {
    offerType = OfferTypes.AmazonPharmacy;
  } else if (pharmacy?.source === 'goodrx') {
    offerType = OfferTypes.GoodRx;
  } else if (pharmacy?.source === 'rxsense') {
    offerType = OfferTypes.RxSense;
  }

  return offerType;
}
