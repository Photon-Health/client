import { Fill, Prescription } from '@photonhealth/sdk/dist/types';
import { getMedicationNames } from '../../utils';
import { HStack, SkeletonText, Tag, TagLabel, Text, VStack } from '@chakra-ui/react';

interface MedicationStackProps {
  order: Order;
  fills: Fill[];
  loading: boolean;
}

interface Order {
  fulfillments?: Fulfillment[];
}

interface Fulfillment {
  prescription: Prescription;
  exceptions: Exception[];
}

interface Exception {
  type: string;
  message: string;
  resolvedAt: string;
}

function exceptionColor(exceptionType: string) {
  switch (exceptionType.toLowerCase()) {
    case 'backordered':
    case 'oos':
    case 'pa_required':
      return 'yellow';
    default:
      return 'gray';
  }
}

function MedicationStack({ order, fills, loading }: MedicationStackProps) {
  if (loading) {
    return <SkeletonText skeletonHeight={5} noOfLines={1} w="300px" />;
  } else if (order.fulfillments) {
    return (
      <VStack w="full" align="start">
        {order.fulfillments.map((fulfillment, i: number) => (
          <HStack key={i}>
            <Text fontWeight="medium" flex="1">
              {fulfillment.prescription.treatment.name}
            </Text>
            {fulfillment.exceptions
              .filter((e) => !e.resolvedAt)
              .map((exception, j: number) => (
                <Tag
                  key={j}
                  size="sm"
                  borderRadius="full"
                  colorScheme={exceptionColor(exception.type)}
                  flexShrink={0}
                >
                  <TagLabel>{exception.message}</TagLabel>
                </Tag>
              ))}
          </HStack>
        ))}
      </VStack>
    );
  } else if (fills) {
    const medicationNames = getMedicationNames(fills);

    return (
      <VStack w="full" align="start">
        {medicationNames.map((med, i: number) => (
          <Text key={i} fontWeight="medium" flex="1">
            {med}
          </Text>
        ))}
      </VStack>
    );
  } else {
    return null;
  }
}

export default MedicationStack;
