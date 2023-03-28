import { memo } from 'react'
import { Card, CardBody, HStack, Tag, TagLabel, TagLeftIcon, Text, VStack } from '@chakra-ui/react'
import { FiRotateCcw, FiStar } from 'react-icons/fi'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

import { UNOPEN_BUSINESS_STATUS_MAP } from '../views/Pharmacy'
import { Rating } from './Rating'
import { formatAddress } from '../utils/general'
import { Pharmacy } from '../utils/models'

dayjs.extend(customParseFormat)

const INFO_COLOR_MAP = {
  Previous: 'green',
  Preferred: 'yellow'
}

const RatingHours = ({ businessStatus, rating, hours }) => {
  if (businessStatus in UNOPEN_BUSINESS_STATUS_MAP) {
    return (
      <Text fontSize="sm" color="red">
        {UNOPEN_BUSINESS_STATUS_MAP[businessStatus]}
      </Text>
    )
  }

  if (!rating || !hours) return null

  const { open, is24Hr, opens, opensDay, closes } = hours

  return (
    <HStack>
      {rating ? <Rating rating={rating} /> : null}
      {rating ? <Text color="gray.400">&bull;</Text> : null}
      <Text fontSize="sm" color={open ? 'green' : 'red'}>
        {open ? 'Open' : 'Closed'}
      </Text>
      {!is24Hr && ((open && closes) || (!open && opens)) ? (
        <Text color="gray.400">&bull;</Text>
      ) : null}
      {open && closes ? (
        <Text fontSize="sm" color="gray.500">
          Closes {dayjs(closes, 'HHmm').format(dayjs(closes, 'HHmm').minute() > 0 ? 'h:mmA' : 'hA')}
        </Text>
      ) : null}
      {!open && opens ? (
        <Text fontSize="sm" color="gray.500">
          Opens {dayjs(opens, 'HHmm').format(dayjs(opens, 'HHmm').minute() > 0 ? 'h:mmA' : 'hA')}
          {opensDay ? ` ${opensDay}` : ''}
        </Text>
      ) : null}
    </HStack>
  )
}

const DistanceAddress = ({ distance, address }) => {
  if (!distance || !address) return null
  return (
    <Text fontSize="sm" color="gray.500" display="inline">
      {distance?.toFixed(1)} mi &bull; {formatAddress(address)}
    </Text>
  )
}

interface PharmacyCardProps {
  pharmacy: Pharmacy
  selected: boolean
  onSelect: Function
}

export const PharmacyCard = memo(function PharmacyCard({
  pharmacy,
  selected,
  onSelect
}: PharmacyCardProps) {
  if (!pharmacy) return null
  return (
    <Card
      w="full"
      bgColor="white"
      border="2px solid"
      borderColor={selected ? 'brand.600' : 'white'}
      cursor="pointer"
      onClick={() => onSelect()}
    >
      <CardBody p={4}>
        <VStack me="auto" align="start" spacing={0}>
          {pharmacy.info ? (
            <Tag size="sm" colorScheme={INFO_COLOR_MAP[pharmacy.info]}>
              <TagLeftIcon
                boxSize="12px"
                as={pharmacy.info === 'Previous' ? FiRotateCcw : FiStar}
              />
              <TagLabel> {pharmacy.info}</TagLabel>
            </Tag>
          ) : null}
          {pharmacy?.hours?.is24Hr ? (
            <Tag size="sm" colorScheme="green">
              <TagLabel>24 hr</TagLabel>
            </Tag>
          ) : null}
          <Text fontSize="md">{pharmacy.name}</Text>

          <RatingHours
            businessStatus={pharmacy.businessStatus}
            rating={pharmacy.rating}
            hours={pharmacy.hours}
          />
          <DistanceAddress distance={pharmacy.distance} address={pharmacy.address} />
        </VStack>
      </CardBody>
    </Card>
  )
})
