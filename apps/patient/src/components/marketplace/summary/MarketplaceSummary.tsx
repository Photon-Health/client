import { Heading, HStack, VStack } from '@chakra-ui/react';
import { useOrderContext } from '../../../views/Main';
import { PrescriptionSummary } from './PrescriptionSummary';

export function MarketplaceSummary() {
  const { order } = useOrderContext();
  const providerName = order.fills[0]?.prescription?.provider?.name?.full ?? '';

  return (
    <VStack data-testid="PrescriptionsSummary" spacing={2} alignItems="start">
      <HStack w="full" justifyContent="space-between">
        <Heading as="h3" size="lg">
          Choose a Pharmacy
        </Heading>
      </HStack>
      <PrescriptionSummary providerName={providerName} />
    </VStack>
  );
}
