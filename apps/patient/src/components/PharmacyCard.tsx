import { memo } from 'react'
import {
  Card,
  CardBody,
  HStack,
  Spacer,
  Tag,
  TagLabel,
  TagLeftIcon,
  Text,
  VStack
} from '@chakra-ui/react'
import { FiRotateCcw, FiStar } from 'react-icons/fi'

import { formatAddress } from '../utils/general'
import { Address } from '../utils/models'

const INFO_COLOR_MAP = {
  Previous: 'green',
  Preferred: 'yellow'
}

interface PharmacyCardProps {
  pharmacy: {
    info: string
    address: Address
    name: string
    distance: number
  }
  selected: boolean
  onSelect: Function
}

export const PharmacyCard = memo(function PharmacyCard({
  pharmacy,
  selected,
  onSelect
}: PharmacyCardProps) {
  return (
    <Card
      w="full"
      backgroundColor="white"
      border="2px solid"
      borderColor={selected ? 'brand.600' : 'white'}
      cursor="pointer"
      onClick={() => onSelect()}
    >
      <CardBody p={4}>
        <HStack spacing={2}>
          <VStack me="auto" align="start" spacing={1}>
            {pharmacy.info ? (
              <Tag size="sm" colorScheme={INFO_COLOR_MAP[pharmacy.info]}>
                <TagLeftIcon
                  boxSize="12px"
                  as={pharmacy.info === 'Previous' ? FiRotateCcw : FiStar}
                />
                <TagLabel> {pharmacy.info}</TagLabel>
              </Tag>
            ) : null}
            <Text fontSize="md">{pharmacy.name}</Text>
            <Text fontSize="sm" color="gray.500">
              {formatAddress(pharmacy.address)}
            </Text>
          </VStack>
          <Spacer />
          <Text whiteSpace="nowrap">{pharmacy?.distance?.toFixed(1)} mi</Text>
        </HStack>
      </CardBody>
    </Card>
  )
})
