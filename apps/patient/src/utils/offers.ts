import { EnrichedPharmacy, OfferBundleDetails, OfferType, OfferTypes } from './models';

export function getOfferType({
  pharmacy,
  offer
}: {
  pharmacy?: EnrichedPharmacy;
  offer?: OfferBundleDetails;
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
