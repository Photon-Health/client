import { memo } from 'react';
import {
  Box,
  Button,
  Collapse,
  HStack,
  Tag,
  TagLabel,
  TagLeftIcon,
  Text,
  VStack,
  Image,
  Container
} from '@chakra-ui/react';
import { FiStar, FiRefreshCcw, FiNavigation } from 'react-icons/fi';
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
  savingPreferred?: boolean;
  selected?: boolean;
  canReroute?: boolean;
  onSelect?: () => void;
  onSetPreferred?: () => void;
  onChangePharmacy?: () => void;
  onGetDirections?: () => void;
  selectable?: boolean;
  showDetails?: boolean;
}

export const PharmacyCardNew = memo(function PharmacyCard({
  pharmacy,
  preferred = false,
  savingPreferred = false,
  selected = false,
  canReroute = true,
  onSelect,
  onChangePharmacy,
  onSetPreferred,
  onGetDirections,
  selectable = false,
  showDetails = true
}: PharmacyCardProps) {
  if (!pharmacy) return null;

  return (
    <Box onClick={() => onSelect && onSelect()} cursor={selectable ? 'pointer' : undefined} py={4}>
      <Container>
        <VStack align="start" w="full" spacing={showDetails ? 1 : 0}>
          <HStack spacing={2}>
            {preferred ? (
              <Tag size="sm" colorScheme="blue">
                <TagLeftIcon boxSize="12px" as={FiStar} />
                <TagLabel> {t.preferred}</TagLabel>
              </Tag>
            ) : null}
            {pharmacy?.showReadyIn30Min ? (
              <Tag size="sm" bgColor="yellow.200">
                <TagLabel>Ready in 30 minutes</TagLabel>
              </Tag>
            ) : null}
          </HStack>
          <VStack align="start" w="full" spacing={0}>
            <HStack spacing={2}>
              {pharmacy?.logo ? <Image src={pharmacy.logo} width="auto" height="19px" /> : null}
              <Text fontSize="md">{pharmacy.name}</Text>
            </HStack>
            {showDetails ? (
              <>
                <Hours
                  isOpen={pharmacy.isOpen}
                  is24Hr={pharmacy.is24Hr}
                  isClosingSoon={pharmacy.isClosingSoon}
                  opens={pharmacy.opens}
                  closes={pharmacy.closes}
                />
                <DistanceAddress distance={pharmacy.distance} address={pharmacy.address} />
              </>
            ) : null}
          </VStack>
        </VStack>
        {showDetails ? (
          <Collapse in={selected && !preferred} animateOpacity>
            <VStack mt={4}>
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
                  {t.makePreferred}
                </Button>
              ) : null}
              {onGetDirections ? (
                <Button
                  mx="auto"
                  size="md"
                  variant="solid"
                  onClick={onGetDirections}
                  leftIcon={<FiNavigation />}
                  w="full"
                  bg="gray.900"
                  color="white"
                >
                  {t.directions}
                </Button>
              ) : null}
              {onChangePharmacy && canReroute ? (
                <Button
                  mx="auto"
                  size="md"
                  variant="outline"
                  onClick={onChangePharmacy}
                  leftIcon={<FiRefreshCcw />}
                  bg="gray.50"
                  color="blue.500"
                  w="full"
                >
                  {t.changePharmacy}
                </Button>
              ) : null}
            </VStack>
          </Collapse>
        ) : null}
      </Container>
    </Box>
  );
});
