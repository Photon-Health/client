import { Button, SlideFade, Text, VStack } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';

import { Pharmacy as EnrichedPharmacy } from '../../utils/models';
import { text as t } from '../../utils/text';
import { HolidayAlert } from '../HolidayAlert';
import { PharmacyCard } from '../PharmacyCard';
import { PharmacyFilters } from '../PharmacyFilters';
import { OfferImpressionTracker } from '../../utils/tracking/OfferImpressionTracker';

interface PickupPharmacyCardListProps {
  pharmacies: EnrichedPharmacy[];
  preferredPharmacy: string;
  savingPreferred: boolean;
  selectedId: string;
  handleSelect: (id: string) => void;
  handleShowMore: () => void;
  handleSetPreferred: (id: string) => void;
  loadingMore: boolean;
  showingAllPharmacies: boolean;
  showPrice?: boolean;
  enableOpenNow: boolean;
  enable24Hr: boolean;
  enablePrice: boolean;
  setEnableOpenNow: (isOpen: boolean) => void;
  setEnable24Hr: (is24Hr: boolean) => void;
  showFilters: boolean;
  location: string;
  currentPharmacyId?: string;
  setCouponModalOpen: (isOpen: boolean) => void;
  numberOfBrandedOptions: number;
  shouldTrackOfferImpressionsAndSelections: boolean;
}

export function PickupTabBar() {
  return (
    <Text
      as="span"
      display="inline-block"
      fontWeight="semibold"
      fontSize="md"
      color="gray.900"
      pb={3}
      borderBottom="2px solid"
      borderColor="blue.500"
      aria-selected="true"
      role="tab"
    >
      {t.pickUp}
    </Text>
  );
}

export const PickupPharmacyCardList = ({
  preferredPharmacy,
  savingPreferred,
  pharmacies,
  selectedId,
  handleSelect,
  handleShowMore,
  handleSetPreferred,
  loadingMore,
  showingAllPharmacies,
  showPrice = true,
  enableOpenNow,
  enable24Hr,
  setEnableOpenNow,
  setEnable24Hr,
  showFilters = true,
  currentPharmacyId,
  numberOfBrandedOptions = 0,
  shouldTrackOfferImpressionsAndSelections,
  children
}: PropsWithChildren<PickupPharmacyCardListProps>) => {
  return (
    <VStack spacing={4} align="stretch" w="full">
      {children ? (
        <VStack spacing={3} align="stretch">
          {children}
        </VStack>
      ) : null}
      {showFilters ? (
        <SlideFade offsetY="60px" in={true}>
          <PharmacyFilters
            enableOpenNow={enableOpenNow}
            enable24Hr={enable24Hr}
            setEnableOpenNow={setEnableOpenNow}
            setEnable24Hr={setEnable24Hr}
          />
        </SlideFade>
      ) : null}
      <HolidayAlert>
        Holiday may affect pharmacy hours. Consider sending to a 24 hour pharmacy.
      </HolidayAlert>
      <VStack align="span" spacing={2}>
        {pharmacies.map((pharmacy: EnrichedPharmacy, i: number) => (
          <SlideFade offsetY="60px" in={true} key={`pickup-pharmacy-${pharmacy.id}-${i}`}>
            <OfferImpressionTracker
              pharmacy={pharmacy}
              ordinalPosition={i + numberOfBrandedOptions}
              isAlreadySelected={selectedId === pharmacy.id}
              enabled={shouldTrackOfferImpressionsAndSelections}
              offer={undefined}
            >
              <PharmacyCard
                pharmacy={pharmacy}
                preferred={pharmacy.id === preferredPharmacy}
                savingPreferred={savingPreferred}
                selected={selectedId === pharmacy.id}
                onSelect={() => handleSelect(pharmacy.id)}
                onSetPreferred={() => handleSetPreferred(pharmacy.id)}
                selectable={true}
                showPrice={showPrice}
                isCurrentPharmacy={pharmacy.id === currentPharmacyId}
              />
            </OfferImpressionTracker>
          </SlideFade>
        ))}
      </VStack>
      {!showingAllPharmacies && (pharmacies?.length > 0 || loadingMore) ? (
        <Button
          variant="link"
          loadingText=""
          isLoading={loadingMore}
          onClick={handleShowMore}
          p={3}
        >
          {t.showMore}
        </Button>
      ) : null}
    </VStack>
  );
};
