import { Box, Heading, HStack, Icon, Image, Text, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import { FiInfo } from 'react-icons/fi';
import { CouponModal } from '.';
import { text as t } from '../utils/text';
import { useOrderContext } from '../views/Main';
import { DiscountCard } from '../__generated__/graphql';
import { Card } from './Card';
import goodrxLogo from '../assets/goodrx_logo.png';

export const Coupons = () => {
  const { order, flattenedFills } = useOrderContext();

  if (!order.discountCards || order.discountCards.length === 0) {
    return null;
  }

  const discountCards = order.discountCards.filter(
    // Filter out discount cards that don't apply to the current pharmacy
    // If the order was rerouted, we might have discount cards from the previous pharmacy
    (card) => card.pharmacyId === order.pharmacy?.id
  );

  if (discountCards.length === 0) {
    return null;
  }

  const isDaw =
    flattenedFills.find((fill) => fill.prescription?.id === discountCards[0].prescriptionId)
      ?.prescription?.dispenseAsWritten ?? false;

  return (
    <VStack w="full" alignItems="stretch" spacing={4}>
      <Heading as="h4" size="md">
        Coupon
      </Heading>
      {/* Show one coupon only */}
      <Coupon coupon={discountCards[0]} showGenericPriceDisclaimer={!isDaw} />
    </VStack>
  );
};

type Coupon = Pick<DiscountCard, 'price' | 'bin' | 'pcn' | 'group' | 'memberId' | 'source'>;
export const Coupon = ({
  coupon,
  showGenericPriceDisclaimer
}: {
  coupon: Coupon;
  showGenericPriceDisclaimer?: boolean;
}) => {
  const [couponModalOpen, setCouponModalOpen] = useState<boolean>(false);

  const { price, bin, pcn, group, memberId, source } = coupon;

  if (!price || !bin || !pcn || !group || !memberId) {
    return null;
  }

  return (
    <Card>
      <CouponModal isOpen={couponModalOpen} onClose={() => setCouponModalOpen(false)} />
      <VStack w="full" align="stretch" spacing={3}>
        <Text fontSize="4xl" alignSelf="center" fontWeight="700" py={0} lineHeight="1">
          ${price.toFixed(2)}
        </Text>
        {showGenericPriceDisclaimer ? (
          <Box w="full" textAlign="center">
            <Text fontSize="md" fontWeight="medium" color="blackAlpha.600">
              {t.genericPriceDisclaimer}
            </Text>
          </Box>
        ) : null}
        <Box bgColor="blue.50" w="full" p={2} borderRadius="xl">
          <Text fontWeight="semibold" fontSize="md">
            {t.showThisCoupon}
          </Text>
        </Box>
        <HStack w="full">
          <Text w="40%">{t.bin}</Text>
          <Text as="b" w="60%">
            {bin}
          </Text>
        </HStack>
        <HStack w="full">
          <Text w="40%">{t.pcn}</Text>
          <Text as="b" w="60%">
            {pcn}
          </Text>
        </HStack>
        <HStack w="full">
          <Text w="40%">{t.group}</Text>
          <Text as="b" w="60%">
            {group}
          </Text>
        </HStack>
        <HStack w="full">
          <Text w="40%">{t.memberId}</Text>
          <Text as="b" w="60%">
            {memberId}
          </Text>
        </HStack>
        {source === 'goodrx' ? (
          <HStack w="full" justify="center">
            <Text fontSize="sm">Powered by</Text>
            <Image src={goodrxLogo} alt="GoodRx" h="20px" />
          </HStack>
        ) : null}
      </VStack>
      <HStack color="blue.500" w="full" justify="center">
        <Icon as={FiInfo} />
        <Text
          as="u"
          textUnderlineOffset="2px"
          fontSize="sm"
          fontWeight="semibold"
          cursor="pointer"
          onClick={() => setCouponModalOpen(true)}
        >
          {t.howToCoupon}
        </Text>
      </HStack>
    </Card>
  );
};
