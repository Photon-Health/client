import {
  Box,
  HStack,
  Tag,
  TagLabel,
  TagLeftIcon,
  Text,
  VStack,
  Image,
  Stack
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

  return (
    <HStack w="full" whiteSpace="nowrap" overflow="hidden">
      {isOpen != null || isClosingSoon ? (
        <Text fontSize="sm" color={color}>
          {text}
        </Text>
      ) : null}
      {!is24Hr && ((isOpen && closes) || (!isOpen && opens)) ? (
        <Text color="gray.400">&bull;</Text>
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
    <Text fontSize={fontSize} color="gray.600" display="inline">
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
  preferred?: boolean;
  showDetails?: boolean;
  boldPharmacyName?: boolean;
  isStatus?: boolean;
}

export const PharmacyInfo = ({
  pharmacy,
  preferred = false,
  showDetails = true,
  boldPharmacyName = true,
  isStatus = false
}: PharmacyInfoProps) => {
  if (!pharmacy) return null;

  return (
    <VStack align="start" w="full" spacing={showDetails ? 1 : 0}>
      <HStack spacing={2}>
        {preferred ? (
          <Tag size="sm" colorScheme="blue">
            <TagLeftIcon boxSize="12px" as={FiStar} />
            <TagLabel> {t.preferred}</TagLabel>
          </Tag>
        ) : null}
        {pharmacy?.showReadyIn30Min && !isStatus ? (
          <Tag size="sm" bgColor="yellow.200">
            <TagLabel>Ready in 30 minutes</TagLabel>
          </Tag>
        ) : null}
      </HStack>
      <VStack align="start" w="full" spacing={0}>
        <HStack spacing={2}>
          {pharmacy?.logo ? <Image src={pharmacy.logo} width="auto" height="19px" /> : null}
          <Text fontSize="md" as={boldPharmacyName ? 'b' : undefined}>
            {pharmacy.name}
          </Text>
        </HStack>
        {showDetails ? (
          <Stack direction={isStatus ? 'column-reverse' : 'column'} gap={0}>
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
          </Stack>
        ) : null}
      </VStack>
    </VStack>
  );
};
