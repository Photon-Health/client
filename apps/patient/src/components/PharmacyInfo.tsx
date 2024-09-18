import { useLocation } from 'react-router-dom';
import {
  Box,
  HStack,
  Tag,
  TagLabel,
  TagLeftIcon,
  Text,
  VStack,
  Image,
  Button
} from '@chakra-ui/react';
import { FiStar } from 'react-icons/fi';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Address, EnrichedPharmacy } from '../utils/models';
import { text as t } from '../utils/text';

import { formatAddress, titleCase } from '../utils/general';
import { useMemo, useState } from 'react';
import { IoChevronDownOutline, IoChevronUpOutline } from 'react-icons/io5';

dayjs.extend(customParseFormat);

interface HoursProps {
  isOpen?: boolean;
  isClosingSoon?: boolean;
  is24Hr?: boolean;
  opens?: string;
  closes?: string;
  hours?: EnrichedPharmacy['hours'];
  showHours?: boolean;
}

const daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

const hoursLookup = Object.fromEntries(daysOfWeek.map((d, i) => [d, i]));

const formatTime = (hstr: string) => {
  const [h, m] = hstr.split(':');
  const hoursInt = parseInt(h, 10);
  return `${hoursInt === 12 ? 12 : hoursInt % 12}:${m} ${hoursInt >= 12 ? 'pm' : 'am'}`;
};

const HoursRow = ({
  hours,
  is24Hr,
  isClosed,
  dayOfWeek
}: {
  hours?: Array<{
    openFrom: string;
    openUntil: string;
  }>;
  is24Hr: boolean;
  isClosed: boolean;
  dayOfWeek: string;
}) => {
  if (isClosed || is24Hr) {
    return (
      <HStack w="full" justifyContent={'space-between'}>
        <Text fontSize="sm" color="gray.500">
          {titleCase(dayOfWeek)}
        </Text>
        <Text fontSize="sm" color="gray.500">
          {is24Hr ? 'Open 24hr' : 'Closed'}
        </Text>
      </HStack>
    );
  }
  if (hours == null || hours.length === 0) return null;
  return (
    <>
      <HStack w="full" justifyContent={'space-between'}>
        <Text fontSize="sm" color="gray.500">
          {titleCase(dayOfWeek)}
        </Text>
        <Text fontSize="sm" color="gray.500">
          {formatTime(hours[0].openFrom)} - {formatTime(hours[0].openUntil)}
        </Text>
      </HStack>
      {/* Include the rest of the hours but without day of week information */}
      {hours.slice(1).map((h) => (
        <HStack w="full" justifyContent={'space-between'} key={h.openFrom}>
          <Text fontSize="sm" color="gray.500">
            {''}
          </Text>
          <Text fontSize="sm" color="gray.500">
            {formatTime(h.openFrom)} - {formatTime(h.openUntil)}
          </Text>
        </HStack>
      ))}
    </>
  );
};

const Hours = ({ is24Hr, isOpen, isClosingSoon, opens, closes, hours, showHours }: HoursProps) => {
  const color = isClosingSoon ? 'orange.500' : isOpen ? 'green.500' : 'red.500';
  const text = is24Hr ? t.open24hrs : isClosingSoon ? t.closingSoon : isOpen ? t.open : t.closed;
  const hasHours = isOpen != null;
  const [hoursOpen, setHoursOpen] = useState(false);

  if (!hasHours) return null;

  const sortedHours = useMemo(
    () =>
      hours?.sort((a, b) =>
        a.dayOfWeek === b.dayOfWeek
          ? a.openFrom.localeCompare(b.openFrom)
          : hoursLookup[a.dayOfWeek] - hoursLookup[b.dayOfWeek]
      ),
    [hours]
  );

  const withDaysClosed = useMemo(
    () =>
      Object.fromEntries(
        daysOfWeek.map((d) => [d, sortedHours?.filter((h) => h.dayOfWeek === d) ?? []])
      ),
    [sortedHours]
  );

  return (
    <VStack w="full">
      <HStack w="full" justifyContent={'space-between'}>
        <HStack w="full" whiteSpace="nowrap" overflow="hidden" height="fit-content">
          {isOpen != null || isClosingSoon ? (
            <Text fontSize="sm" color={color} as="b">
              {text}
            </Text>
          ) : null}
          {!is24Hr && ((isOpen && closes) || (!isOpen && opens)) ? (
            <Text color="gray.500">&bull;</Text>
          ) : null}
          {!is24Hr && isClosingSoon ? (
            <Text fontSize="sm" color="gray.500" isTruncated>
              {closes}
            </Text>
          ) : null}
          {!is24Hr && !isClosingSoon && isOpen && closes ? (
            <Text fontSize="sm" color="gray.500" isTruncated>
              {closes}
            </Text>
          ) : null}
          {!is24Hr && !isClosingSoon && !isOpen && opens ? (
            <Text fontSize="sm" color="gray.500" isTruncated>
              {opens}
            </Text>
          ) : null}
        </HStack>
        {showHours && hours && (
          <Button
            variant="minimal"
            onClick={() => setHoursOpen(!hoursOpen)}
            rightIcon={hoursOpen ? <IoChevronUpOutline /> : <IoChevronDownOutline />}
          />
        )}
      </HStack>
      {hoursOpen &&
        daysOfWeek.map((d) => {
          const h = withDaysClosed[d];
          return (
            <HoursRow
              is24Hr={h[0]?.is24Hr}
              isClosed={h.length === 0}
              hours={h}
              key={d}
              dayOfWeek={d}
            />
          );
        })}
    </VStack>
  );
};

interface DistanceAddressProps {
  distance?: number;
  address?: Address | null;
  fontSize?: string;
}

const DistanceAddress = ({ distance, address, fontSize = 'sm' }: DistanceAddressProps) => {
  if (!address) return null;
  return (
    <Text fontSize={fontSize} color="gray.500" display="inline">
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

interface PharmacyInfoProps {
  pharmacy: EnrichedPharmacy;
  tagline?: string;
  preferred?: boolean;
  showDetails?: boolean;
  availableInYourArea?: boolean;
  freeDelivery?: boolean;
  boldPharmacyName?: boolean;
  isStatus?: boolean;
  selected?: boolean;
  showHours?: boolean;
}

export const PharmacyInfo = ({
  pharmacy,
  tagline,
  preferred = false,
  showDetails = true,
  availableInYourArea = false,
  freeDelivery = false,
  boldPharmacyName = true,
  isStatus = false,
  showHours = false
}: PharmacyInfoProps) => {
  if (!pharmacy) return null;

  const location = useLocation();

  const showPreferredTag = preferred;
  const showReadyIn30MinTag = pharmacy?.showReadyIn30Min && !isStatus;
  const showAvailableInYourAreaTag = availableInYourArea;
  const showFreeDeliveryTag = freeDelivery;
  const whiteLabelDeliveryPharmacy =
    pharmacy.name === 'Capsule Pharmacy' && location.pathname === '/pharmacy';

  return (
    <VStack align="start" w="full" spacing={1}>
      {showPreferredTag ||
      showReadyIn30MinTag ||
      showAvailableInYourAreaTag ||
      showFreeDeliveryTag ? (
        <HStack spacing={2} m={0} p={0}>
          {showPreferredTag ? (
            <Tag size="sm" colorScheme="blue">
              <TagLeftIcon boxSize="12px" as={FiStar} />
              <TagLabel> {t.preferred}</TagLabel>
            </Tag>
          ) : null}
          {showReadyIn30MinTag ? (
            <Tag size="sm" bgColor="yellow.200">
              <TagLabel>Ready in 30 minutes</TagLabel>
            </Tag>
          ) : null}
          {showAvailableInYourAreaTag ? (
            <Tag size="sm" bgColor="green.100" color="green.600" mb={1}>
              <TagLabel fontWeight="bold">Available in your area</TagLabel>
            </Tag>
          ) : null}
          {showFreeDeliveryTag ? (
            <Tag size="sm" bgColor="green.100" color="green.600" mb={1}>
              <TagLabel fontWeight="bold">Free Delivery</TagLabel>
            </Tag>
          ) : null}
        </HStack>
      ) : null}
      <HStack w="full">
        <HStack w="full">
          {pharmacy?.logo && !whiteLabelDeliveryPharmacy ? (
            <Box boxSize="32px" overflow="hidden">
              <Image
                src={pharmacy.logo}
                width="auto"
                height="32px"
                boxSize="100%"
                objectFit="contain"
              />
            </Box>
          ) : null}
          <Text fontSize="md" fontWeight={boldPharmacyName ? 'bold' : 'medium'}>
            {whiteLabelDeliveryPharmacy ? 'Free Express Delivery' : pharmacy.name}
          </Text>
        </HStack>
      </HStack>
      {showDetails ? (
        <VStack
          direction={isStatus ? 'column-reverse' : 'column'}
          spacing={1}
          w="full"
          alignItems={'start'}
        >
          {tagline ? (
            <Text fontSize="sm" color="gray.500">
              {tagline}
            </Text>
          ) : null}
          <DistanceAddress
            distance={pharmacy.distance}
            address={pharmacy.address}
            fontSize={isStatus ? 'md' : 'sm'}
          />
          <Hours
            isOpen={pharmacy.isOpen}
            is24Hr={pharmacy.is24Hr}
            isClosingSoon={pharmacy.isClosingSoon}
            opens={pharmacy.opens}
            closes={pharmacy.closes}
            hours={pharmacy.hours}
            showHours={showHours}
          />
        </VStack>
      ) : null}
    </VStack>
  );
};
