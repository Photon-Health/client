import { Box, HStack, Image, Tag, TagLabel, TagLeftIcon, Text, VStack } from '@chakra-ui/react';
import { FiInfo, FiStar, FiTag } from 'react-icons/fi';
import { Tooltip } from '../Tooltip';
import { text as t } from '../../utils/text';
import { OfferBundleDetails, OfferPromotionTypes, Promotion } from '../../utils/models';
import { formatPrice } from '../../utils/formatters';

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

const getLargestPromotionAmount = (promotions: Array<Promotion> | undefined): number =>
  Math.max(...(promotions ?? []).map((p) => p.amountSaved ?? 0));

const CouponTag = ({
  promotions,
  size = 'sm'
}: {
  promotions?: Array<Promotion>;
  size?: 'sm' | 'md';
}) => {
  const largestPromotion = getLargestPromotionAmount(promotions);
  const isMd = size === 'md';
  return (
    promotions?.length && (
      <HStack
        bg="orange.50"
        color="orange.500"
        borderRadius="md"
        px={isMd ? 3 : 1.5}
        py={isMd ? 2 : 0.5}
        w={isMd ? 'full' : undefined}
      >
        <FiTag size={isMd ? 14 : 10} />
        {largestPromotion > 0 ? (
          <Text fontSize={isMd ? 'sm' : 'xs'}>
            <strong>Up to ${formatPrice(largestPromotion)}</strong> off with coupon if eligible
          </Text>
        ) : (
          <Text fontSize={isMd ? 'sm' : 'xs'} fontWeight="bold">
            with coupon if eligible
          </Text>
        )}
      </HStack>
    )
  );
};

interface OfferInfoProps {
  pharmacy?: Pick<OfferBundleDetails['pharmacy'], 'id' | 'name' | 'logo'>;
  offer: OfferBundleDetails;
  /** order.pharmacy when not autorouted — independent of selected */
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
        return <PreferredTag />;
      case 'current':
        return <CurrentPharmacyTag />;
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

  // if they cost is higher than the retail amount
  // there's no point in showing what the strike price because it will be clear they're paying more
  const retailIsSameOrLower =
    offer.retailAmount != null && costAmount != null && offer.retailAmount <= costAmount;
  const retailAmount = retailIsSameOrLower ? undefined : offer.retailAmount;
  const retailAmountTitle = retailIsSameOrLower ? undefined : offer.retailAmountTitle;

  const isAmazonPharmacy = pharmacy.id === import.meta.env.VITE_AMAZON_PHARMACY_ID;

  const isMultiRx = (offer.medications?.length ?? 0) > 1;

  const singleMedPromotions = !isMultiRx
    ? offer.medications?.[0]?.promotions?.filter(
        (promo) => promo.type === OfferPromotionTypes.AmazonPharmacyRXCoupon
      )
    : undefined;

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
            {retailAmount && retailAmount > costAmount ? (
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

      {!isMultiRx && <CouponTag size="md" promotions={singleMedPromotions} />}

      {isMultiRx && (
        <VStack w="full" bg="gray.50" borderRadius="md" p={3}>
          {offer.medications?.map((med) => (
            <HStack key={med.name} w="full" justify="space-between" align="start">
              <VStack align="flex-start">
                <Tooltip
                  label={med.name}
                  placement="top-start"
                  wrapperProps={{
                    onClick: (e) => {
                      e.stopPropagation();
                    }
                  }}
                >
                  <Text fontSize="sm" color="gray.700" noOfLines={1}>
                    {med.name}
                  </Text>
                </Tooltip>
                <CouponTag
                  promotions={med.promotions?.filter(
                    (promo) => promo.type === OfferPromotionTypes.AmazonPharmacyRXCoupon
                  )}
                />
              </VStack>

              {med.amount ? ( // only show the price if we have one
                <VStack align="flex-end" spacing={1}>
                  <Text fontSize="sm" fontWeight="bold">
                    ${formatPrice(med.amount)}
                  </Text>
                  {/* only show retail amount if it's higher than the current amount */}
                  {med.retailAmount && med.retailAmount > med.amount && (
                    <Text fontSize="xs" color="gray.400" textDecoration="line-through">
                      ${formatPrice(med.retailAmount)}
                    </Text>
                  )}
                </VStack>
              ) : null}
            </HStack>
          ))}
        </VStack>
      )}

      <VStack w="full" alignItems="start">
        <Text fontSize="sm" fontWeight="semibold">
          {offer.deliveryEstimate}
        </Text>
        {isAmazonPharmacy && (
          <Tooltip
            label="This pharmacy has paid for preferred placement. Photon Health does not endorse this pharmacy over others. Other pharmacies may offer this medication at the same or similar price."
            placement="bottom-start"
            wrapperProps={{
              onClick: (e) => {
                e.stopPropagation();
              }
            }}
          >
            <HStack alignItems={'center'} spacing={1}>
              <Text fontSize="sm" color="gray.500">
                Sponsored
              </Text>
              <FiInfo color="var(--chakra-colors-gray-500)" size={16} />
            </HStack>
          </Tooltip>
        )}
      </VStack>
    </VStack>
  );
};
