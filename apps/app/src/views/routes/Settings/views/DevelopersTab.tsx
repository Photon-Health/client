import { VStack } from '@chakra-ui/react';
import { Credentials } from '../components/client-credentials/Credentials';
import { Webhooks } from '../components/webhooks/Webhooks';

export const DevelopersTab = () => {
  return (
    <VStack spacing={5} align="left">
      <Credentials />
      <Webhooks />
    </VStack>
  );
};
