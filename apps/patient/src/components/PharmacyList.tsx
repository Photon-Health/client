import { Button, SlideFade, VStack } from '@chakra-ui/react'

import { PharmacyCard } from '../components/PharmacyCard'
import t from '../utils/text.json'

export const PharmacyList = ({ pharmacies, selectedId, handleSelect, handleShowMore }) => {
  return (
    <VStack spacing={6} align="span">
      <VStack align="span" spacing={3}>
        {pharmacies.map((pharmacy) => (
          <SlideFade key={pharmacy.id} offsetY="60px" in={true}>
            <PharmacyCard
              pharmacy={pharmacy}
              selected={selectedId === pharmacy.id}
              onSelect={() => handleSelect(pharmacy.id)}
            />
          </SlideFade>
        ))}
      </VStack>
      {pharmacies?.length > 0 ? (
        <Button
          colorScheme="brand"
          color="brandLink"
          variant="link"
          textDecoration="none"
          onClick={handleShowMore}
        >
          {t.pharmacy.showMore}
        </Button>
      ) : null}
    </VStack>
  )
}
