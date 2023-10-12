import { VStack } from '@chakra-ui/react';

import { Profile } from '../components/Profile';
import { Webhooks } from '../components/Webhooks';
import { Credentials } from '../components/Credentials';

export const UserTab = () => {
  return (
    <VStack spacing={5} maxW="45em" align="left">
      <Profile />
      <Credentials />
      <Webhooks />
    </VStack>
  );
};
