import { Box, HStack, Image, Tag, TagLabel, TagLeftIcon, Text, VStack } from '@chakra-ui/react';
import { FiStar } from 'react-icons/fi';
import { text as t } from '../../utils/text';

import { formatPrice } from '../../utils/formatters';
import { Offer } from '../pharmacy-card-list/BrandedOptions';

const PreferredTag = () => {
  return (
    <Tag size="sm" colorScheme="blue">
      <TagLeftIcon boxSize="12px" as={FiStar} />
      <TagLabel>{t.preferred}</TagLabel>
    </Tag>
  );
};

const CurrentPharmacyTag = () => {
  return (
    <Tag
      size="md"
      bgColor="red.50"
      color="red.600"
      borderColor="red.200"
      borderRadius="full"
      borderWidth="1px"
    >
      <TagLabel data-testid="pharmacy-info-current-pharmacy" fontWeight="bold">
        Current Pharmacy
      </TagLabel>
    </Tag>
  );
};

interface OfferInfoProps {
  pharmacy?: Pick<Offer['pharmacy'], 'id' | 'name' | 'logo'>;
  offer: Offer;
  isCurrentPharmacy?: boolean;
  isPreferred?: boolean;
}

export const OfferInfo = ({ pharmacy, offer, isCurrentPharmacy, isPreferred }: OfferInfoProps) => {
  if (!pharmacy) {
    return null;
  }

  const offerTags = [
    ...offer.tags,
    ...(isPreferred ? [t.preferred] : []),
    ...(isCurrentPharmacy ? ['current'] : [])
  ].map((tag) => {
    switch (tag) {
      case t.preferred:
        return <PreferredTag key={tag} />;
      case 'current':
        return <CurrentPharmacyTag key={tag} />;
      default:
        return (
          <Tag key={tag} size="sm" colorScheme="blue">
            <TagLabel>{tag}</TagLabel>
          </Tag>
        );
    }
  });

  // if we aren't explicitly given the cost amount
  // we'll expect patients to pay the retail amount
  const costAmount = offer.costAmount ?? offer.retailAmount;
  const costAmountTitle = offer.costAmountTitle ?? offer.retailAmountTitle;

  // if they're already paying the retail amount
  // there's no point in showing what they'll save
  const retailAmount = costAmount === offer.retailAmount ? undefined : offer.retailAmount;
  const retailAmountTitle = costAmount === offer.retailAmount ? undefined : offer.retailAmountTitle;

  const isAmazonPharmacy = pharmacy.id === process.env.REACT_APP_AMAZON_PHARMACY_ID;

  return (
    <VStack data-testid="pharmacy-info" align="start" w="full">
      {offerTags.length > 0 ? (
        <HStack spacing={2} alignItems="start" w="full">
          {offerTags}
        </HStack>
      ) : null}

      <HStack w="full" justify="space-between">
        <HStack w="full">
          {pharmacy.logo ? (
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
          <Text data-testid="pharmacy-info-name" fontSize="md" fontWeight={'medium'}>
            {offer.pharmacy.name}
          </Text>
        </HStack>

        {costAmount ? ( // only show the price if we have one
          <VStack spacing={0} align="flex-end" minW="fit-content">
            <Text fontSize="sm">{costAmountTitle}</Text>
            <Text fontWeight="bold">${formatPrice(costAmount)}</Text>
            {retailAmount ? (
              <Text fontSize="sm" color="gray.500">
                {retailAmountTitle}{' '}
                <Text as="span" textDecoration="line-through">
                  ${formatPrice(retailAmount)}
                </Text>
              </Text>
            ) : null}
          </VStack>
        ) : null}
      </HStack>

      <VStack w="full" alignItems="start">
        <Text fontSize="sm" fontWeight="semibold">
          {offer.deliveryEstimate}
        </Text>
        {isAmazonPharmacy && (
          <Text fontSize="sm" color="gray.500">
            Sponsored
          </Text>
        )}
      </VStack>
    </VStack>
  );
};
