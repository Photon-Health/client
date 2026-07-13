import { Card, CardBody, HStack, Icon, Text } from '@chakra-ui/react';
import { FiCheckCircle } from 'react-icons/fi';
import { PharmacyTabKey } from '../pharmacy-tabs';

// Banner telling the patient that their order has been sent to a pharmacy on the other tab
export const SentPharmacyBanner = ({
  sentPharmacyName,
  sentToMailOrder,
  activeTab
}: {
  sentPharmacyName?: string;
  sentToMailOrder: boolean;
  activeTab: PharmacyTabKey;
}) => {
  const showOn: PharmacyTabKey = sentToMailOrder ? 'pickup' : 'delivery';
  if (!sentPharmacyName || activeTab !== showOn) return null;

  return (
    <Card bg="blue.50" boxShadow="none" borderRadius="xl">
      <CardBody p={4}>
        <HStack spacing={3}>
          <Icon as={FiCheckCircle} color="blue.500" boxSize={5} />
          <Text fontSize="sm" color="gray.800">
            Sent to <b>{sentPharmacyName}</b>. Want a different one? Pick a pharmacy below and
            we&apos;ll reroute it.
          </Text>
        </HStack>
      </CardBody>
    </Card>
  );
};
