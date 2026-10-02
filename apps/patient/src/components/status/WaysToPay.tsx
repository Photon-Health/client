import { Divider, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import { Card } from '../Card';
import { formatPrice } from '../../utils/formatters';
import { text as t } from '../../utils/text';

const WayToPayRow = ({
  label,
  description,
  amount
}: {
  label: string;
  description: string;
  amount: number;
}) => (
  <HStack w="full" justify="space-between" align="start" spacing={4}>
    <VStack align="start" spacing={0}>
      <Text fontSize="md" fontWeight="semibold">
        {label}
      </Text>
      <Text fontSize="sm" color="gray.500">
        {description}
      </Text>
    </VStack>
    <Text fontSize="md" fontWeight="bold" minW="fit-content">
      ${formatPrice(amount)}
    </Text>
  </HStack>
);

export const WaysToPay = ({
  insuranceAmount,
  couponPrice
}: {
  insuranceAmount: number;
  couponPrice?: number;
}) => (
  <VStack data-testid="ways-to-pay" w="full" alignItems="stretch" spacing={4}>
    <VStack alignItems="start" spacing={1}>
      <Heading as="h4" size="md">
        {t.waysToPay}
      </Heading>
      <Text color="gray.500">{t.waysToPaySubtitle}</Text>
    </VStack>
    <Card>
      <VStack w="full" spacing={3}>
        <WayToPayRow
          label={t.insuranceEstimate}
          description={t.insuranceEstimateDescription}
          amount={insuranceAmount}
        />
        {couponPrice != null ? (
          <>
            <Divider />
            <WayToPayRow
              label={t.couponPrice}
              description={t.couponPriceDescription}
              amount={couponPrice}
            />
          </>
        ) : null}
      </VStack>
    </Card>
  </VStack>
);
