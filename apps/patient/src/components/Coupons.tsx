import { Box, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import { FiInfo } from 'react-icons/fi';
import { CouponModal } from '.';
import { text as t } from '../utils/text';
import { useOrderContext } from '../views/Main';
import { DiscountCard } from '../__generated__/graphql';
import { Card } from './Card';

export const Coupons = () => {
  const { order } = useOrderContext();

  if (!order.discountCards || order.discountCards.length === 0) {
    return null;
  }

  const discountCards = order.discountCards.filter(
    // Filter out discount cards that don't apply to the current pharmacy
    // If the order was rerouted, we might have discount cards from the previous pharmacy
    (card) => card.pharmacyId === order.pharmacy?.id
  );

  return (
    <VStack w="full" spacing={4} mx={0}>
      {discountCards.map((card) => (
        <Coupon key={card.id} coupon={card} />
      ))}
    </VStack>
  );
};

type CouponProps = Pick<DiscountCard, 'price' | 'bin' | 'pcn' | 'group' | 'memberId'>;
export const Coupon = ({ coupon }: { coupon: CouponProps }) => {
  const [couponModalOpen, setCouponModalOpen] = useState<boolean>(false);

  const { price, bin, pcn, group, memberId } = coupon;

  if (!price || !bin || !pcn || !group || !memberId) {
    return null;
  }

  return (
    <Card>
      <CouponModal isOpen={couponModalOpen} onClose={() => setCouponModalOpen(false)} />
      <Text fontSize="4xl" fontWeight="700" py={0} lineHeight="1">
        ${price.toFixed(2)}
      </Text>
      <Box bgColor="blue.50" w="full" textAlign="center" p={2} borderRadius="xl">
        <Text fontWeight="semibold" fontSize="md">
          {t.showThisCoupon}
        </Text>
      </Box>
      <VStack w="full" align="stretch">
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
      </VStack>
      <HStack color="blue.500">
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
