import { memo } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  Collapse,
  Divider,
  HStack,
  Tag,
  TagLabel,
  TagLeftIcon,
  Text,
  VStack,
  useBreakpointValue
} from '@chakra-ui/react';
import { FiRotateCcw, FiStar, FiThumbsUp, FiRefreshCcw, FiNavigation } from 'react-icons/fi';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { types } from '@photonhealth/sdk';
import { Pharmacy as EnrichedPharmacy } from '../utils/models';

import { UNOPEN_BUSINESS_STATUS_MAP } from '../views/Pharmacy';
import { Rating } from './Rating';
import { formatAddress } from '../utils/general';

dayjs.extend(customParseFormat);

interface RatingHoursProps {
  businessStatus: string;
  rating: number;
  hours: {
    open?: boolean;
    opens?: string;
    opensDay?: string;
    closes?: string;
    is24Hr?: boolean;
  };
}

const RatingHours = ({ businessStatus, rating, hours }: RatingHoursProps) => {
  if (businessStatus in UNOPEN_BUSINESS_STATUS_MAP) {
    return (
      <Text fontSize="sm" color="red">
        {UNOPEN_BUSINESS_STATUS_MAP[businessStatus]}
      </Text>
    );
  }

  return (
    <HStack w="full" whiteSpace="nowrap" overflow="hidden">
      {rating ? <Rating rating={rating} /> : null}
      {rating ? <Text color="gray.400">&bull;</Text> : null}
      {hours?.open !== undefined ? (
        <Text fontSize="sm" color={hours?.open ? 'green' : 'red'}>
          {hours?.open ? 'Open' : 'Closed'}
        </Text>
      ) : null}
      {!hours?.is24Hr && ((hours?.open && hours?.closes) || (!hours?.open && hours?.opens)) ? (
        <Text color="gray.400">&bull;</Text>
      ) : null}
      {hours?.open && hours?.closes ? (
        <Text fontSize="sm" color="gray.500" isTruncated>
          Closes{' '}
          {dayjs(hours?.closes, 'HHmm').format(
            dayjs(hours?.closes, 'HHmm').minute() > 0 ? 'h:mmA' : 'hA'
          )}
        </Text>
      ) : null}
      {!hours?.open && hours?.opens ? (
        <Text fontSize="sm" color="gray.500" isTruncated>
          Opens{' '}
          {dayjs(hours?.opens, 'HHmm').format(
            dayjs(hours?.opens, 'HHmm').minute() > 0 ? 'h:mmA' : 'hA'
          )}
          {hours?.opensDay ? ` ${hours?.opensDay}` : ''}
        </Text>
      ) : null}
    </HStack>
  );
};

interface DistanceAddressProps {
  distance?: number;
  address?: types.Address;
}

const DistanceAddress = ({ distance, address }: DistanceAddressProps) => {
  if (!address) return null;
  return (
    <Text fontSize="sm" color="gray.500" display="inline">
      {distance ? `${distance.toFixed(1)} mi` : ''}
      {distance && (
        <Box as="span" display="inline" mx={2}>
          &bull;
        </Box>
      )}
      {formatAddress(address)}
    </Text>
  );
};

interface PharmacyCardProps {
  pharmacy: EnrichedPharmacy;
  preferred?: boolean;
  previous?: boolean;
  goodService?: boolean;
  savingPreferred?: boolean;
  selected?: boolean;
  canReroute?: boolean;
  onSelect?: () => void;
  onSetPreferred?: () => void;
  onChangePharmacy?: () => void;
  onGetDirections?: () => void;
}

export const PharmacyCard = memo(function PharmacyCard({
  pharmacy,
  preferred = false,
  previous = false,
  goodService = false,
  savingPreferred = false,
  selected = false,
  canReroute = true,
  onSelect,
  onChangePharmacy,
  onSetPreferred,
  onGetDirections
}: PharmacyCardProps) {
  const isMobile = useBreakpointValue({ base: true, md: false });

  if (!pharmacy) return null;

  return (
    <Card
      bgColor="white"
      border="2px solid"
      borderColor={selected && onSelect ? 'brand.600' : 'white'}
      cursor="pointer"
      onClick={() => onSelect && onSelect()}
      mx={isMobile ? -3 : undefined}
    >
      <CardBody p={3}>
        <VStack align="start" w="full" spacing={1}>
          <HStack spacing={2}>
            {preferred ? (
              <Tag size="sm" colorScheme="blue">
                <TagLeftIcon boxSize="12px" as={FiStar} />
                <TagLabel> Preferred</TagLabel>
              </Tag>
            ) : null}
            {previous && !preferred ? (
              <Tag size="sm" colorScheme="green">
                <TagLeftIcon boxSize="12px" as={FiRotateCcw} />
                <TagLabel> Previous</TagLabel>
              </Tag>
            ) : null}
            {goodService ? (
              <Tag size="sm" colorScheme="purple">
                <TagLeftIcon boxSize="12px" as={FiThumbsUp} />
                <TagLabel> Good service</TagLabel>
              </Tag>
            ) : null}
            {pharmacy?.hours?.is24Hr ? (
              <Tag size="sm" colorScheme="green">
                <TagLabel>24 hr</TagLabel>
              </Tag>
            ) : null}
          </HStack>
          <VStack align="start" w="full" spacing={0}>
            <Text fontSize="md">{pharmacy.name}</Text>
            <RatingHours
              businessStatus={pharmacy.businessStatus}
              rating={pharmacy.rating}
              hours={pharmacy.hours}
            />
            <DistanceAddress distance={pharmacy.distance} address={pharmacy.address} />
          </VStack>
        </VStack>
      </CardBody>
      <Collapse in={selected && !preferred} animateOpacity>
        <Divider />
        <CardFooter p={2}>
          {onSetPreferred ? (
            <Button
              mx="auto"
              size="sm"
              variant="ghost"
              color="link"
              onClick={onSetPreferred}
              isLoading={savingPreferred}
              leftIcon={<FiStar />}
            >
              Make this my preferred pharmacy
            </Button>
          ) : null}
          {onChangePharmacy && canReroute ? (
            <Button
              mx="auto"
              size="sm"
              variant="ghost"
              colorScheme="brand"
              onClick={onChangePharmacy}
              leftIcon={<FiRefreshCcw />}
            >
              Change pharmacy
            </Button>
          ) : null}
          {onGetDirections ? (
            <Button
              mx="auto"
              size="sm"
              variant="ghost"
              colorScheme="brand"
              onClick={onGetDirections}
              leftIcon={<FiNavigation />}
            >
              Get directions
            </Button>
          ) : null}
        </CardFooter>
      </Collapse>
    </Card>
  );
});
