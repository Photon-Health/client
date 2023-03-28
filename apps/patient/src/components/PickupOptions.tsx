import { Button, Heading, HStack, SlideFade, Text, VStack } from '@chakra-ui/react'

import { PharmacyCard } from './PharmacyCard'
import t from '../utils/text.json'
import { Pharmacy } from '../utils/models'

export const PickupOptions = ({
  pharmacies,
  selectedId,
  handleSelect,
  handleShowMore,
  loadingMore,
  showingAllPharmacies,
  isMobile
}) => {
  return (
    <VStack spacing={3} align="span" w="full">
      {pharmacies?.length > 0 ? (
        <SlideFade offsetY="60px" in={true}>
          <VStack spacing={1} align="start">
            <Heading as="h5" size="sm">
              Pick Up
            </Heading>
            <HStack justify="space-between" w="full">
              <Text>Your prescriptions at a nearby location.</Text>
              {!isMobile && pharmacies.length > 0 ? (
                <Text size="sm" color="gray.500" whiteSpace="nowrap" alignSelf="flex-end">
                  {t.pharmacy.sorted}
                </Text>
              ) : null}
            </HStack>
          </VStack>
        </SlideFade>
      ) : null}

      <VStack align="span" spacing={3}>
        {pharmacies.map((pharmacy: Pharmacy, i: number) => (
          <SlideFade offsetY="60px" in={true}>
            <PharmacyCard
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
          {t.pharmacy.showMore}
        </Button>
      ) : null}
      {showingAllPharmacies ? (
        <Text color="gray.500" textAlign="center">
          Showing all pharmacies
        </Text>
      ) : null}
    </VStack>
  )
}
