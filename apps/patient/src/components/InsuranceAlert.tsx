import { Card, CardBody, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { OrderExceptionType } from 'apps/patient/src/__generated__/graphql';
import { FiInfo } from 'react-icons/fi';

function getInsuranceAlertDetails(exceptions: OrderExceptionType[]) {
  if (exceptions.some((e) => e === 'PHARMACY_NEEDS_INSURANCE_INFO')) {
    return {
      text: 'Please bring your insurance card to pick up your prescription.',
      color: 'blue'
    };
  }
  if (exceptions.some((e) => e === 'PHARMACY_DOES_NOT_ACCEPT_INSURANCE')) {
    return {
      text: 'Your pharmacy does not accept your insurance on file. Use a discount card to pay cash price or change your pharmacy.',
      color: 'orange'
    };
  }
  return null;
}

interface InsuranceAlertProps {
  exceptions: {
    exceptionType: OrderExceptionType;
  }[];
}

export const InsuranceAlert = ({ exceptions }: InsuranceAlertProps) => {
  const details = getInsuranceAlertDetails(exceptions.map((e) => e.exceptionType));
  return details ? (
    <VStack align="span" spacing={2} px="2">
      <Card
        bgColor="white"
        border="1px solid"
        borderColor="orange.500"
        borderRadius="2xl"
        background="#FFFAEB"
        mx={{ base: -3, md: undefined }}
        color="orange.500"
      >
        <CardBody p={3}>
          <HStack>
            <Icon color="orange.500" as={FiInfo} fontWeight="bold" />
            <Text fontWeight="semibold">{details?.text}</Text>
          </HStack>
        </CardBody>
      </Card>
    </VStack>
  ) : null;
};
