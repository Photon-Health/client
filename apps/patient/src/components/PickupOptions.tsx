import { Button, Heading, SlideFade, Text, VStack } from '@chakra-ui/react';

import { Pharmacy as EnrichedPharmacy } from '../utils/models';
import { text as t } from '../utils/text';
import { HolidayAlert } from './HolidayAlert';
import { PharmacyCard } from './PharmacyCard';
import { PharmacyFilters } from './PharmacyFilters';

interface PickupOptionsProps {
  pharmacies: EnrichedPharmacy[];
  preferredPharmacy: string;
  savingPreferred: boolean;
  selectedId: string;
  handleSelect: (id: string) => void;
  handleShowMore: () => void;
  handleSetPreferred: (id: string) => void;
  loadingMore: boolean;
  showingAllPharmacies: boolean;
  showHeading: boolean;
  enableOpenNow: boolean;
  enable24Hr: boolean;
  setEnableOpenNow: (isOpen: boolean) => void;
  setEnable24Hr: (is24Hr: boolean) => void;
  location: string;
  currentPharmacyId?: string;
}

export const PickupOptions = ({
  preferredPharmacy,
  savingPreferred,
  pharmacies,
  selectedId,
  handleSelect,
  handleShowMore,
  handleSetPreferred,
  loadingMore,
  showingAllPharmacies,
  showHeading,
  enableOpenNow,
  enable24Hr,
  setEnableOpenNow,
  setEnable24Hr,
  currentPharmacyId
}: PickupOptionsProps) => {
  return (
    <VStack spacing={3} align="span" w="full">
      {showHeading ? (
        <SlideFade offsetY="60px" in={true}>
          <VStack spacing={1} align="start">
            <Heading as="h5" size="sm">
              {t.pickUp}
            </Heading>
            <Text>{t.getNearby}</Text>
          </VStack>
        </SlideFade>
      ) : null}
      <SlideFade offsetY="60px" in={true}>
        <PharmacyFilters
          enableOpenNow={enableOpenNow}
          enable24Hr={enable24Hr}
          setEnableOpenNow={setEnableOpenNow}
          setEnable24Hr={setEnable24Hr}
        />
      </SlideFade>
      <HolidayAlert>
        Holiday may affect pharmacy hours. Consider sending to a 24 hour pharmacy.
      </HolidayAlert>
      <VStack align="span" spacing={2}>
        {pharmacies.map((pharmacy: EnrichedPharmacy, i: number) => (
          <SlideFade offsetY="60px" in={true} key={`pickup-pharmacy-${pharmacy.id}-${i}`}>
            <PharmacyCard
              pharmacy={pharmacy}
              preferred={pharmacy.id === preferredPharmacy}
              savingPreferred={savingPreferred}
              selected={selectedId === pharmacy.id}
              onSelect={() => handleSelect(pharmacy.id)}
              onSetPreferred={() => handleSetPreferred(pharmacy.id)}
              selectable={true}
              showPrice
              isCurrentPharmacy={pharmacy.id === currentPharmacyId}
            />
          </SlideFade>
        ))}
      </VStack>
      {!showingAllPharmacies && (pharmacies?.length > 0 || loadingMore) ? (
        <Button
          colorScheme="brand"
          color="link"
          variant="link"
          textDecoration="none"
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
