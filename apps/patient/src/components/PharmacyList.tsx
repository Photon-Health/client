import { Button, SlideFade, Text, VStack } from '@chakra-ui/react'

import { PharmacyCard } from '../components/PharmacyCard'
import t from '../utils/text.json'
import { Pharmacy } from '../utils/models'

export const PharmacyList = ({
  pharmacies,
  selectedId,
  handleSelect,
  handleShowMore,
  loadingMore,
  showingAllPharmacies
}) => {
  return (
    <VStack spacing={6} align="span">
      <VStack align="span" spacing={3}>
        {pharmacies.map((pharmacy: Pharmacy, i: number) => (
          <SlideFade key={`${pharmacy.name}-${pharmacy.id}-${i}`} offsetY="60px" in={true}>
            <PharmacyCard
              pharmacy={pharmacy}
              selected={selectedId === pharmacy.id}
              onSelect={() => handleSelect(pharmacy.id)}
            />
          </SlideFade>
        ))}
      </VStack>
      {!showingAllPharmacies && pharmacies?.length > 0 ? (
        <Button
          colorScheme="brand"
          color="brandLink"
          variant="link"
          textDecoration="none"
          loadingText=""
          isLoading={loadingMore}
          onClick={handleShowMore}
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
