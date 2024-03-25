import { VStack } from '@chakra-ui/react';

import { Profile } from '../components/profile/Profile';
export const UserTab = () => {
  return (
    <VStack spacing={5} align="left" bg="white">
      <Profile />
    </VStack>
  );
};
