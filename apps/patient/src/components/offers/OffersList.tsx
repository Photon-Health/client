import { SlideFade } from '@chakra-ui/react';
import { OfferImpressionTracker } from '../../utils/tracking/OfferImpressionTracker';
import { OfferCard } from './OfferCard';
import { OfferBundleDetails } from '../../utils/models';

export const OffersList = ({
  offers,
  shouldTrackOfferImpressionsAndSelections,
  selectedPharmacyId,
  preferredPharmacyId,
  autoroutedPharmacyId,
  currentPharmacyId,
  handleSelect
}: {
  offers: OfferBundleDetails[];
  shouldTrackOfferImpressionsAndSelections: boolean;
  selectedPharmacyId: string;
  preferredPharmacyId: string;
  autoroutedPharmacyId?: string;
  currentPharmacyId?: string;
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
              isAutoroutedPharmacy={autoroutedPharmacyId === offer.pharmacy.id}
              isCurrentPharmacy={currentPharmacyId === offer.pharmacy.id}
              selected={selectedPharmacyId === offer.pharmacy.id}
              isPreferred={preferredPharmacyId === offer.pharmacy.id}
              handleSelect={handleSelect}
            />
          </OfferImpressionTracker>
        </SlideFade>
      ))}
    </>
  );
};
