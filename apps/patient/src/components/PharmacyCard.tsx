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
import { text as t } from '../utils/text';

import { Rating } from './Rating';
import { formatAddress } from '../utils/general';

dayjs.extend(customParseFormat);

interface RatingHoursProps {
  rating?: number;
  isOpen?: boolean;
  is24Hr?: boolean;
  opens?: string;
  closes?: string;
}

const RatingHours = ({ rating, is24Hr, isOpen, opens, closes }: RatingHoursProps) => {
  return (
    <HStack w="full" whiteSpace="nowrap" overflow="hidden">
      {rating ? <Rating rating={rating} /> : null}
      {rating && isOpen != null ? <Text color="gray.400">&bull;</Text> : null}
      {isOpen != null ? (
        <Text fontSize="sm" color={isOpen ? 'green' : 'red'}>
          {isOpen ? t.open : t.closed}
        </Text>
      ) : null}
      {!is24Hr && ((isOpen && closes) || (!isOpen && opens)) ? (
        <Text color="gray.400">&bull;</Text>
      ) : null}
      {!is24Hr && isOpen && closes ? (
        <Text fontSize="sm" color="gray.500" isTruncated>
          {closes}
        </Text>
      ) : null}
      {!is24Hr && !isOpen && opens ? (
        <Text fontSize="sm" color="gray.500" isTruncated>
          {opens}
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
  selectable?: boolean;
  showDetails?: boolean;
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
  onGetDirections,
  selectable = false,
  showDetails = true
}: PharmacyCardProps) {
  if (!pharmacy) return null;

  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Card
      bgColor="white"
      border="2px solid"
      borderColor={selected && onSelect ? 'brand.600' : 'white'}
      onClick={() => onSelect && onSelect()}
      mx={isMobile ? -3 : undefined}
      cursor={selectable ? 'pointer' : undefined}
    >
      <CardBody p={3}>
        <VStack align="start" w="full" spacing={showDetails ? 1 : 0}>
          <HStack spacing={2}>
            {preferred ? (
              <Tag size="sm" colorScheme="blue">
                <TagLeftIcon boxSize="12px" as={FiStar} />
                <TagLabel> {t.preferred}</TagLabel>
              </Tag>
            ) : null}
            {previous && !preferred ? (
              <Tag size="sm" colorScheme="green">
                <TagLeftIcon boxSize="12px" as={FiRotateCcw} />
                <TagLabel> {t.previous}</TagLabel>
              </Tag>
            ) : null}
            {goodService ? (
              <Tag size="sm" colorScheme="purple">
                <TagLeftIcon boxSize="12px" as={FiThumbsUp} />
                <TagLabel> {t.goodService}</TagLabel>
              </Tag>
            ) : null}
            {pharmacy?.is24Hr ? (
              <Tag size="sm" colorScheme="green">
                <TagLabel>{t.open24hrs}</TagLabel>
              </Tag>
            ) : null}
          </HStack>
          <VStack align="start" w="full" spacing={0}>
            <Text fontSize="md">{pharmacy.name}</Text>
            {showDetails ? (
              <>
                <RatingHours
                  rating={pharmacy.rating}
                  isOpen={pharmacy.isOpen}
                  is24Hr={pharmacy.is24Hr}
                  opens={pharmacy.opens}
                  closes={pharmacy.closes}
                />
                <DistanceAddress distance={pharmacy.distance} address={pharmacy.address} />
              </>
            ) : null}
          </VStack>
        </VStack>
      </CardBody>
      {showDetails ? (
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
                {t.makePreferred}
              </Button>
            ) : null}
            {onChangePharmacy && canReroute ? (
              <Button
                mx="auto"
                size="sm"
                variant="ghost"
                color="link"
                onClick={onChangePharmacy}
                leftIcon={<FiRefreshCcw />}
              >
                {t.changePharmacy}
              </Button>
            ) : null}
            {onGetDirections ? (
              <Button
                mx="auto"
                size="sm"
                variant="ghost"
                color="link"
                onClick={onGetDirections}
                leftIcon={<FiNavigation />}
              >
                {t.directions}
              </Button>
            ) : null}
          </CardFooter>
        </Collapse>
      ) : null}
    </Card>
  );
});
