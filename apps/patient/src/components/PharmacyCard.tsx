import { memo } from 'react';
import {
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
import { FiRotateCcw, FiStar, FiThumbsUp } from 'react-icons/fi';
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
  rating: string;
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
      <Text fontSize="sm" color={hours?.open ? 'green' : 'red'}>
        {hours?.open ? 'Open' : 'Closed'}
      </Text>
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
  if (!distance || !address) return null;
  return (
    <Text fontSize="sm" color="gray.500" display="inline">
      {distance?.toFixed(1)} mi &bull; {formatAddress(address)}
    </Text>
  );
};

interface PharmacyCardProps {
  pharmacy: EnrichedPharmacy;
  preferred?: boolean;
  previous?: boolean;
  goodService?: boolean;
  savingPreferred: boolean;
  selected: boolean;
  onSelect: Function;
  onSetPreferred: () => void;
}

export const PharmacyCard = memo(function PharmacyCard({
  pharmacy,
  preferred,
  previous,
  goodService,
  savingPreferred,
  selected,
  onSelect,
  onSetPreferred
}: PharmacyCardProps) {
  const isMobile = useBreakpointValue({ base: true, md: false });

  if (!pharmacy) return null;

  return (
    <Card
      bgColor="white"
      border="2px solid"
      borderColor={selected ? 'brand.600' : 'white'}
      cursor="pointer"
      onClick={() => onSelect()}
      mx={isMobile ? -3 : undefined}
    >
      <CardBody p={3}>
        <VStack align="start" w="full" spacing={1}>
          {preferred ? (
            <Tag size="sm" colorScheme="yellow">
              <TagLeftIcon boxSize="12px" as={FiStar} />
              <TagLabel> Preferred</TagLabel>
            </Tag>
          ) : null}
          {previous && !preferred ? (
            <Tag size="sm" colorScheme="blue">
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
        </CardFooter>
      </Collapse>
    </Card>
  );
});
