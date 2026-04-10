import { useState } from 'react';
import { CouponModal } from './CouponModal';
import { Box, HStack, Icon, Link, Text, VStack } from '@chakra-ui/react';
import { formatPrice } from '../../utils/formatters';
import { text as t } from '../../utils/text';
import { FiInfo } from 'react-icons/fi';
import { DiscountCard } from '../../__generated__/graphql';
import { CouponSourceLogo } from './CouponSourceLogo';
import { Card } from '../Card';

export type Coupon = Pick<
  DiscountCard,
  'price' | 'retailPrice' | 'bin' | 'pcn' | 'group' | 'memberId' | 'source'
>;

export const EmbeddedCouponCard = ({ coupon }: { coupon: Coupon }) => {
  const [couponModalOpen, setCouponModalOpen] = useState<boolean>(false);
  const { price, retailPrice, bin, pcn, group, memberId, source } = coupon;

  const handleOpenCouponModal = () => {
    setCouponModalOpen(true);
  };

  return (
    <Card>
      <CouponModal isOpen={couponModalOpen} onClose={() => setCouponModalOpen(false)} />
      <VStack w="full" align="stretch" spacing={3}>
        <Text fontSize="4xl" alignSelf="center" fontWeight="700" py={0} lineHeight="1">
          ${formatPrice(price)}
        </Text>
        {retailPrice && retailPrice > price ? (
          <Text alignSelf="center" color="gray.500">
            Retail price:{' '}
            <span style={{ textDecoration: 'line-through' }}>${formatPrice(retailPrice)}</span>
          </Text>
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
        {CouponSourceLogo(source)}
      </VStack>
      <HStack color="blue.500" w="full" justify="center">
        <Icon as={FiInfo} />
        <Link fontSize="sm" onClick={handleOpenCouponModal}>
          {t.howToCoupon}
        </Link>
      </HStack>
    </Card>
  );
};
