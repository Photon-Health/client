import { Card, CardBody, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { OrderExceptionType } from 'apps/patient/src/__generated__/graphql';
import { FiInfo } from 'react-icons/fi';

const insuranceAlertDetailsMap = {
  PHARMACY_NEEDS_INSURANCE_INFO: {
    text: 'Please bring your insurance card to pick up your prescription.',
    color: 'blue'
  },
  PHARMACY_DOES_NOT_ACCEPT_INSURANCE: {
    text: 'Your pharmacy does not accept your insurance on file. Use a discount card to pay cash price or change your pharmacy.',
    color: 'orange'
  }
};

interface InsuranceAlertProps {
  exception: OrderExceptionType;
}

export const InsuranceAlert = ({ exception }: InsuranceAlertProps) => {
  const details = insuranceAlertDetailsMap[exception as keyof typeof insuranceAlertDetailsMap];
  return details ? (
    <VStack align="span" spacing={2} px="2">
      <Card
        bgColor="white"
        border="1px solid"
        borderColor={`${details.color}.500`}
        borderRadius="2xl"
        background={details.color === 'orange' ? '#FFFAEB' : '#EFF8FF'}
        mx={{ base: -3, md: undefined }}
        color={`${details.color}.500`}
      >
        <CardBody p={3}>
          <HStack>
            <Icon color={`${details.color}.500`} as={FiInfo} fontWeight="bold" />
            <Text fontWeight="semibold">{details?.text}</Text>
          </HStack>
        </CardBody>
      </Card>
    </VStack>
  ) : null;
};
