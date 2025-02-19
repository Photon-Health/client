import React from 'react';
import { Card, CardBody, HStack, Icon, Text, VStack } from '@chakra-ui/react';

function insuranceAlertText(props: OrderStatusHeaderProps) {
  if (props.exception === 'PHARMACY_NEEDS_INSURANCE_INFO') {
    return 'Please bring your insurance card to pick up your prescription.';
  }
  if (props.exception === 'PHARMACY_DOES_NOT_ACCEPT_INSURANCE') {
    return 'Your pharmacy does not accept your insurance on file. Use a discount card to pay cash price or change your pharmacy.';
  }
  return null;
}

export const InsuranceAlert = ({
  exceptions
}: {
  children: React.ReactNode | React.ReactNode[];
}) => {
  return (
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
            <Text fontWeight="semibold">{children}</Text>
          </HStack>
        </CardBody>
      </Card>
    </VStack>
  );
};
