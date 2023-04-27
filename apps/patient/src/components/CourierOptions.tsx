import { Heading, SlideFade, Text, VStack } from '@chakra-ui/react'

import t from '../utils/text.json'
import { CourierPharmacyCard } from './CourierPharmacyCard'

interface Props {
  options: string[]
  location: string
  selectedId: string
  handleSelect: Function
  patientAddress: string
}

export const CourierOptions = ({
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
            {t.pharmacy.courier.heading}
          </Heading>
          <Text size="sm">
            {t.pharmacy.courier.subheading} {patientAddress}
          </Text>
        </VStack>
      </SlideFade>

      {options.map((id) => (
        <CourierPharmacyCard pharmacyId={id} selectedId={selectedId} handleSelect={handleSelect} />
      ))}
    </VStack>
  )
}
