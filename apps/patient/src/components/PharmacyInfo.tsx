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
  Spacer
} from '@chakra-ui/react';
import { FiStar } from 'react-icons/fi';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { types } from '@photonhealth/sdk';
import { Pharmacy as EnrichedPharmacy } from '../utils/models';
import { text as t } from '../utils/text';

import { formatAddress } from '../utils/general';

dayjs.extend(customParseFormat);

interface HoursProps {
  isOpen?: boolean;
  isClosingSoon?: boolean;
  is24Hr?: boolean;
  opens?: string;
  closes?: string;
}

const Hours = ({ is24Hr, isOpen, isClosingSoon, opens, closes }: HoursProps) => {
  const color = isClosingSoon ? 'orange.500' : isOpen ? 'green' : 'red';
  const text = is24Hr ? t.open24hrs : isClosingSoon ? t.closingSoon : isOpen ? t.open : t.closed;
  const hasHours = isOpen != null;

  if (!hasHours) return null;

  return (
    <HStack w="full" whiteSpace="nowrap" overflow="hidden" height="fit-content">
      {isOpen != null || isClosingSoon ? (
        <Text fontSize="sm" color={color}>
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
  );
};

interface DistanceAddressProps {
  distance?: number;
  address?: types.Address | null;
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
}

export const PharmacyInfo = ({
  pharmacy,
  tagline,
  preferred = false,
  showDetails = true,
  availableInYourArea = false,
  freeDelivery = false,
  boldPharmacyName = true,
  isStatus = false
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
        <Spacer />
        <Text fontWeight="bold">$9.50</Text>
      </HStack>
      {showDetails ? (
        <VStack direction={isStatus ? 'column-reverse' : 'column'} spacing={1}>
          {tagline ? (
            <Text fontSize="sm" color="gray.500">
              {tagline}
            </Text>
          ) : null}
          <Hours
            isOpen={pharmacy.isOpen}
            is24Hr={pharmacy.is24Hr}
            isClosingSoon={pharmacy.isClosingSoon}
            opens={pharmacy.opens}
            closes={pharmacy.closes}
          />
          <DistanceAddress
            distance={pharmacy.distance}
            address={pharmacy.address}
            fontSize={isStatus ? 'md' : 'sm'}
          />
        </VStack>
      ) : null}
    </VStack>
  );
};
