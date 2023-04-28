import { Heading, SlideFade, Text, VStack } from '@chakra-ui/react'

import t from '../utils/text.json'
import { BrandedPharmacyCard } from './BrandedPharmacyCard'

interface Props {
  type: 'mailOrder' | 'courier'
  options: string[]
  location: string
  selectedId: string
  handleSelect: (id: string) => void
  patientAddress: string
}

export const BrandedOptions = ({
  type,
  options,
  location,
  selectedId,
  handleSelect,
  patientAddress
}: Props) => {
  if (!location) return null

  return (
    <VStack spacing={2} align="span" w="full">
      <SlideFade offsetY="60px" in={true}>
        <VStack spacing={1} align="start">
          <Heading as="h5" size="sm">
            {t.pharmacy[type].heading}
          </Heading>
          <Text size="sm">
            {t.pharmacy[type].subheading} {patientAddress}
          </Text>
        </VStack>
      </SlideFade>

      {options.map((id) => (
        <BrandedPharmacyCard
          key={id}
          pharmacyId={id}
          selectedId={selectedId}
          handleSelect={handleSelect}
        />
      ))}
    </VStack>
  )
}
