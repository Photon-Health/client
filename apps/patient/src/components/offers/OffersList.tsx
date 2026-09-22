import { SlideFade } from '@chakra-ui/react';
import { OfferImpressionTracker } from '../../utils/tracking/OfferImpressionTracker';
import { OfferCard } from './OfferCard';
import { PharmacyOffer } from '../../utils/models';
import { isDeliveryOffer } from '../../utils/offerPlacement';

export const OffersList = ({
  offers,
  shouldTrackOfferImpressionsAndSelections,
  selectedPharmacyId,
  preferredPharmacyId,
  autoroutedPharmacyId,
  currentPharmacyId,
  handleSelect,
  handleSetPreferred,
  savingPreferred = false,
  numberOfPrecedingOptions = 0
}: {
  offers: PharmacyOffer[];
  shouldTrackOfferImpressionsAndSelections: boolean;
  selectedPharmacyId: string;
  preferredPharmacyId: string;
  autoroutedPharmacyId?: string;
  currentPharmacyId?: string;
  handleSelect: (id: string) => void;
  handleSetPreferred?: (id: string) => void;
  savingPreferred?: boolean;
  numberOfPrecedingOptions?: number;
}) => {
  return (
    <>
      {offers.map((offer, index) => (
        <SlideFade offsetY="60px" in={true} key={`pharmacy-${offer.pharmacy.id}`}>
          <OfferImpressionTracker
            key={offer.pharmacy.id}
            pharmacy={offer.pharmacy}
            ordinalPosition={index + numberOfPrecedingOptions}
            isAlreadySelected={selectedPharmacyId === offer.pharmacy.id}
            enabled={shouldTrackOfferImpressionsAndSelections}
            offer={offer}
          >
            <OfferCard
              key={offer.pharmacy.id}
              offer={offer}
              isAutoroutedPharmacy={autoroutedPharmacyId === offer.pharmacy.id}
              isPharmacyFulfillingCurrentOrder={currentPharmacyId === offer.pharmacy.id}
              selected={selectedPharmacyId === offer.pharmacy.id}
              isPreferred={preferredPharmacyId === offer.pharmacy.id}
              handleSelect={handleSelect}
              savingPreferred={savingPreferred}
              // delivery pharmacies can't be a preferred pickup pharmacy
              onSetPreferred={
                handleSetPreferred && !isDeliveryOffer(offer)
                  ? () => handleSetPreferred(offer.pharmacy.id)
                  : undefined
              }
            />
          </OfferImpressionTracker>
        </SlideFade>
      ))}
    </>
  );
};
