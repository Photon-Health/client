import { SlideFade } from '@chakra-ui/react';
import { OfferImpressionTracker } from '../../utils/tracking/OfferImpressionTracker';
import { Offer } from '../pharmacy-card-list';
import { OfferCard } from './OfferCard';

export const OffersList = ({
  offers,
  shouldTrackOfferImpressionsAndSelections,
  selectedPharmacyId,
  preferredPharmacyId,
  handleSelect
}: {
  offers: Offer[];
  shouldTrackOfferImpressionsAndSelections: boolean;
  selectedPharmacyId: string;
  preferredPharmacyId: string;
  handleSelect: (id: string) => void;
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
            isAlreadySelected={selectedPharmacyId === offer.pharmacyId}
            enabled={shouldTrackOfferImpressionsAndSelections}
          >
            <OfferCard
              key={offer.pharmacyId}
              offer={offer}
              pharmacyId={offer.pharmacyId || 'Unknown Pharmacy ID'}
              isPharmacyFulfillingCurrentOrder={false}
              selected={selectedPharmacyId === offer.pharmacyId}
              isPreferred={preferredPharmacyId === offer.pharmacyId}
              handleSelect={handleSelect}
            />
          </OfferImpressionTracker>
        </SlideFade>
      ))}
    </>
  );
};
