import { Heading, HStack, Text, VStack } from '@chakra-ui/react';
import { useOrderContext } from '../../../views/Main';
import { PrescriptionSummary } from './PrescriptionSummary';

export function MarketplaceSummary() {
  const { order } = useOrderContext();
  const providerName = order.fills[0]?.prescription?.provider?.name;
  const formattedProviderName =
    providerName?.title != null
      ? `${providerName.title} ${providerName.last}`
      : providerName?.full ?? '';

  return (
    <VStack data-testid="PrescriptionsSummary" spacing={2} alignItems="start">
      <HStack w="full" justifyContent="space-between">
        <Heading as="h3" size="lg">
          Choose a Pharmacy
        </Heading>
      </HStack>
      <HStack spacing="1.5" alignItems="flex-start" flexWrap="wrap">
        <Text fontWeight="medium" className="mp-mask">
          {order.patient.name.first}, {formattedProviderName} sent
        </Text>
        <PrescriptionSummary />
      </HStack>
    </VStack>
  );
}
