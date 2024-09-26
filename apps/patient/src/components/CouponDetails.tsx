import { Box, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { FC, useState } from 'react';
import { FiInfo } from 'react-icons/fi';
import { CouponModal } from '../components';
import { text as t } from '../utils/text';
import { useOrderContext } from '../views/Main';

export const CouponDetails: FC = () => {
  const [couponModalOpen, setCouponModalOpen] = useState<boolean>(false);
  const { order } = useOrderContext();

  if (!order.discountCards || order.discountCards.length === 0) {
    return null;
  }

  const { price, bin, pcn, group, memberId } = order.discountCards[0];

  if (!price || !bin || !pcn || !group || !memberId) {
    return null;
  }

  return (
    <VStack w="full" spacing={4} mx={0}>
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
    </VStack>
  );
};
