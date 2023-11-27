import { VStack } from '@chakra-ui/react';

import { Profile } from '../components/Profile';
export const UserTab = () => {
  return (
    <VStack spacing={5} align="left">
      <Profile />
    </VStack>
  );
};
