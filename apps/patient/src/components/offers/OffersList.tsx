import { SlideFade } from '@chakra-ui/react';
import { OfferImpressionTracker } from '../../utils/tracking/OfferImpressionTracker';
import { Offer } from '../pharmacy-card-list';
import { OfferCard } from './OfferCard';

export const OffersList = ({
  offers,
  shouldTrackOfferImpressionsAndSelections,
  selectedPharmacyId,
  preferredPharmacyIds,
  handleSelect
}: {
  offers: Offer[];
  shouldTrackOfferImpressionsAndSelections: boolean;
  selectedPharmacyId: string;
  preferredPharmacyIds: string[];
  handleSelect: (id: string) => void;
}) => {
  return (
    <>
      {offers.map((offer, index) => (
        <SlideFade offsetY="60px" in={true} key={`pharmacy-${offer.pharmacy.id}`}>
          <OfferImpressionTracker
            key={offer.pharmacy.id}
            pharmacy={{
              id: offer.pharmacy.id,
              name: offer.pharmacy.name
            }}
            ordinalPosition={index}
            isAlreadySelected={selectedPharmacyId === offer.pharmacy.id}
            enabled={shouldTrackOfferImpressionsAndSelections}
            offer={offer}
          >
            <OfferCard
              key={offer.pharmacy.id}
              offer={offer}
              isPharmacyFulfillingCurrentOrder={false}
              selected={selectedPharmacyId === offer.pharmacy.id}
              isPreferred={preferredPharmacyIds.includes(offer.pharmacy.id)}
              handleSelect={handleSelect}
            />
          </OfferImpressionTracker>
        </SlideFade>
      ))}
    </>
  );
};
