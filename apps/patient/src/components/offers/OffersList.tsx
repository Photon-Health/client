import { SlideFade } from '@chakra-ui/react';
import { OfferImpressionTracker } from '../../utils/tracking/OfferImpressionTracker';
import { OfferCard } from './OfferCard';
import { PharmacyOfferGroup } from '../../utils/models';
import { isDeliveryOffer } from '../../utils/offerPlacement';

export const OffersList = ({
  offerGroups,
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
  offerGroups: PharmacyOfferGroup[];
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
      {offerGroups.map((offerGroup, index) => (
        <SlideFade offsetY="60px" in={true} key={`pharmacy-${offerGroup.pharmacy.id}`}>
          <OfferImpressionTracker
            key={offerGroup.pharmacy.id}
            pharmacy={offerGroup.pharmacy}
            ordinalPosition={index + numberOfPrecedingOptions}
            isAlreadySelected={selectedPharmacyId === offerGroup.pharmacy.id}
            enabled={shouldTrackOfferImpressionsAndSelections}
            offerGroup={offerGroup}
          >
            <OfferCard
              key={offerGroup.pharmacy.id}
              offerGroup={offerGroup}
              isAutoroutedPharmacy={autoroutedPharmacyId === offerGroup.pharmacy.id}
              isPharmacyFulfillingCurrentOrder={currentPharmacyId === offerGroup.pharmacy.id}
              selected={selectedPharmacyId === offerGroup.pharmacy.id}
              isPreferred={preferredPharmacyId === offerGroup.pharmacy.id}
              handleSelect={handleSelect}
              savingPreferred={savingPreferred}
              // delivery pharmacies can't be a preferred pickup pharmacy
              onSetPreferred={
                handleSetPreferred && !isDeliveryOffer(offerGroup)
                  ? () => handleSetPreferred(offerGroup.pharmacy.id)
                  : undefined
              }
            />
          </OfferImpressionTracker>
        </SlideFade>
      ))}
    </>
  );
};
