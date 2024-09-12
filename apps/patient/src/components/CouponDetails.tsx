import { Box, Container, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { FC, useState } from 'react';
import { FiInfo } from 'react-icons/fi';

import { CouponModal } from '../components';
import { text as t } from '../utils/text';

export const CouponDetails: FC = () => {
  const [couponModalOpen, setCouponModalOpen] = useState(false);

  return (
    <Container>
      <CouponModal isOpen={couponModalOpen} onClose={() => setCouponModalOpen(false)} />
      <VStack w="full" spacing={4}>
        <Text fontSize="4xl" fontWeight="700" py={0} lineHeight="1">
          $8.71
        </Text>
        <Box bgColor="blue.50" w="full" textAlign="center" p={2} borderRadius="xl">
          <Text fontWeight="semibold" fontSize="md">
            {t.showThisCoupon}
          </Text>
        </Box>
        <HStack w="full" align="start">
          <VStack w="30%" align="start">
            <Text>{t.bin}</Text>
            <Text>{t.pcn}</Text>
            <Text>{t.group}</Text>
            <Text>{t.memberId}</Text>
          </VStack>
          <VStack w="70%" align="start">
            <Text as="b">015995</Text>
            <Text as="b">GDC</Text>
            <Text as="b">DR33</Text>
            <Text as="b">HFFF867485</Text>
          </VStack>
        </HStack>
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
    </Container>
  );
};
