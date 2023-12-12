import { Button, Heading, SlideFade, Text, VStack } from '@chakra-ui/react';

import { PharmacyCard } from './PharmacyCard';
import { text as t } from '../utils/text';
import { Pharmacy as EnrichedPharmacy } from '../utils/models';
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
  courierEnabled: boolean;
  enableOpenNow: boolean;
  enable24Hr: boolean;
  setEnableOpenNow: (isOpen: boolean) => void;
  setEnable24Hr: (is24Hr: boolean) => void;
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
  courierEnabled,
  enableOpenNow,
  enable24Hr,
  setEnableOpenNow,
  setEnable24Hr
}: PickupOptionsProps) => {
  return (
    <VStack spacing={3} align="span" w="full">
      {courierEnabled ? (
        <SlideFade offsetY="60px" in={true}>
          <VStack spacing={1} align="start">
            <Heading as="h5" size="sm">
              {t.pharmacy.PICK_UP.heading}
            </Heading>
            <Text>{t.pharmacy.PICK_UP.subheading}</Text>
          </VStack>
        </SlideFade>
      ) : null}

      {pharmacies?.length > 0 ? (
        <SlideFade offsetY="60px" in={true}>
          <PharmacyFilters
            enableOpenNow={enableOpenNow}
            enable24Hr={enable24Hr}
            setEnableOpenNow={setEnableOpenNow}
            setEnable24Hr={setEnable24Hr}
          />
        </SlideFade>
      ) : null}

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
          {t.pharmacy.PICK_UP.showMore}
        </Button>
      ) : null}
      {showingAllPharmacies ? (
        <Text color="gray.500" textAlign="center">
          {t.pharmacy.PICK_UP.showingAll}
        </Text>
      ) : null}
    </VStack>
  );
};
