import { VStack } from '@chakra-ui/react';

import { Organization } from '../components/organization/Organization';
import { OrganizationSettings } from '../components/organization/OrganizationSettings';

export const OrganizationTab = () => {
  return (
    <VStack spacing={5} align="left">
      <Organization />
      <OrganizationSettings />
    </VStack>
  );
};
