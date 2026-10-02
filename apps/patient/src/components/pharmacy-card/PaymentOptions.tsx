import { Divider, HStack, Text, VStack } from '@chakra-ui/react';

import { PaymentOption } from '../../utils/models';
import { formatPrice } from '../../utils/formatters';
import { text as t } from '../../utils/text';

const PaymentOptionRow = ({ option }: { option: PaymentOption }) => (
  <HStack w="full" justify="space-between" align="baseline" spacing={2}>
    <Text fontSize="md">{option.label}</Text>
    <HStack spacing={2} minW="fit-content">
      {option.retailAmount != null && option.retailAmount > option.amount ? (
        <Text fontSize="md" color="gray.500" textDecoration="line-through">
          ${formatPrice(option.retailAmount)}
        </Text>
      ) : null}
      <Text fontSize="md" fontWeight="bold">
        ${formatPrice(option.amount)}
      </Text>
    </HStack>
  </HStack>
);

export const PaymentOptions = ({ options }: { options: PaymentOption[] }) => {
  if (options.length === 0) {
    return null;
  }

  return (
    <VStack data-testid="payment-options" w="full" align="start" spacing={2}>
      <Divider />
      {/* a single price gets no label */}
      {options.length > 1 ? (
        <Text fontSize="sm" color="gray.500">
          {t.waysToPay}
        </Text>
      ) : null}
      {options.map((option, index) => (
        <PaymentOptionRow key={`${option.label}-${index}`} option={option} />
      ))}
    </VStack>
  );
};
