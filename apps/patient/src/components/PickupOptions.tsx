import {
  Button,
  Heading,
  HStack,
  SlideFade,
  Text,
  VStack,
  useBreakpointValue
} from '@chakra-ui/react';

import { PharmacyCard } from './PharmacyCard';
import t from '../utils/text.json';
import { Pharmacy } from '../utils/models';

interface PickupOptionsProps {
  pharmacies: Pharmacy[];
  preferredPharmacy: string;
  settingPreferred: boolean;
  selectedId: string;
  handleSelect: (id: string) => void;
  handleShowMore: () => void;
  handleSetPreferred: (id: string) => void;
  loadingMore: boolean;
  showingAllPharmacies: boolean;
  courierEnabled: boolean;
}

export const PickupOptions = ({
  preferredPharmacy,
  settingPreferred,
  pharmacies,
  selectedId,
  handleSelect,
  handleShowMore,
  handleSetPreferred,
  loadingMore,
  showingAllPharmacies,
  courierEnabled
}: PickupOptionsProps) => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <VStack spacing={3} align="span" w="full">
      {pharmacies?.length > 0 && courierEnabled ? (
        <SlideFade offsetY="60px" in={true}>
          <VStack spacing={1} align="start">
            <Heading as="h5" size="sm">
              {t.pharmacy.PICK_UP.heading}
            </Heading>
            <HStack justify="space-between" w="full">
              <Text>{t.pharmacy.PICK_UP.subheading}</Text>
              {!isMobile && pharmacies.length > 0 ? (
                <Text size="sm" color="gray.500" whiteSpace="nowrap" alignSelf="flex-end">
                  {t.pharmacy.PICK_UP.sorted}
                </Text>
              ) : null}
            </HStack>
          </VStack>
        </SlideFade>
      ) : null}

      <VStack align="span" spacing={2}>
        {pharmacies.map((pharmacy: Pharmacy, i: number) => (
          <SlideFade offsetY="60px" in={true} key={`pickup-pharmacy-${pharmacy.id}-${i}`}>
            <PharmacyCard
              pharmacy={pharmacy}
              preferred={pharmacy.id === preferredPharmacy}
              settingPreferred={settingPreferred}
              selected={selectedId === pharmacy.id}
              onSelect={() => handleSelect(pharmacy.id)}
              onSetPreferred={() => handleSetPreferred(pharmacy.id)}
            />
          </SlideFade>
        ))}
      </VStack>
      {!showingAllPharmacies && (pharmacies?.length > 0 || loadingMore) ? (
        <Button
          colorScheme="brand"
          color="brandLink"
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
