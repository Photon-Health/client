import { VStack } from '@chakra-ui/react';

import { Organization } from '../components/organization/Organization';
export const OrganizationTab = () => {
  return (
    <VStack spacing={5} align="left" bg="white">
      <Organization />
    </VStack>
  );
};
