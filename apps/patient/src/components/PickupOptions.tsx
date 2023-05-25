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

export const PickupOptions = ({
  pharmacies,
  selectedId,
  handleSelect,
  handleShowMore,
  loadingMore,
  showingAllPharmacies,
  courierEnabled
}) => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <VStack spacing={3} align="span" w="full">
      {pharmacies?.length > 0 && courierEnabled ? (
        <SlideFade offsetY="60px" in={true}>
          <VStack spacing={1} align="start">
            <Heading as="h5" size="sm">
              {t.pharmacy.pickup.heading}
            </Heading>
            <HStack justify="space-between" w="full">
              <Text>{t.pharmacy.pickup.subheading}</Text>
              {!isMobile && pharmacies.length > 0 ? (
                <Text size="sm" color="gray.500" whiteSpace="nowrap" alignSelf="flex-end">
                  {t.pharmacy.pickup.sorted}
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
              index={i}
              pharmacy={pharmacy}
              selected={selectedId === pharmacy.id}
              onSelect={() => handleSelect(pharmacy.id)}
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
          {t.pharmacy.pickup.showMore}
        </Button>
      ) : null}
      {showingAllPharmacies ? (
        <Text color="gray.500" textAlign="center">
          {t.pharmacy.pickup.showingAll}
        </Text>
      ) : null}
    </VStack>
  );
};
