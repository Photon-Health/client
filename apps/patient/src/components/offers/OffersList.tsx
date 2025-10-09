import { SlideFade } from '@chakra-ui/react';
import { OfferImpressionTracker } from '../../utils/tracking/OfferImpressionTracker';
import { Offer } from '../pharmacy-card-list';
import { OfferCard } from './OfferCard';

export const OffersList = ({
  offers,
  shouldTrackOfferImpressionsAndSelections,
  selectedId,
  preferredPharmacyId
}: {
  offers: Offer[];
  shouldTrackOfferImpressionsAndSelections: boolean;
  selectedId: string;
  preferredPharmacyId: string;
}) => {
  return (
    <>
      {offers.map((offer, index) => (
        <SlideFade offsetY="60px" in={true} key={`pharmacy-${offer.pharmacyId}`}>
          <OfferImpressionTracker
            key={offer.pharmacyId}
            pharmacy={{
              id: offer.pharmacyId || 'Unknown Pharmacy ID',
              name: offer.pharmacyName || 'Unknown Pharmacy Name'
            }}
            ordinalPosition={index}
            isAlreadySelected={selectedId === offer.pharmacyId}
            enabled={shouldTrackOfferImpressionsAndSelections}
          >
            <OfferCard
              key={offer.pharmacyId}
              offer={offer}
              pharmacyId={offer.pharmacyId || 'Unknown Pharmacy ID'}
              isPharmacyFulfillingCurrentOrder={false}
              selected={selectedId === offer.pharmacyId}
              isPreferred={preferredPharmacyId === offer.pharmacyId}
              handleSelect={() => {}}
            />
          </OfferImpressionTracker>
        </SlideFade>
      ))}
    </>
  );
};
