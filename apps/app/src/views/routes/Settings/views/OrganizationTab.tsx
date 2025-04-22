import { VStack } from '@chakra-ui/react';

import usePermissions from 'apps/app/src/hooks/usePermissions';
import { Organization } from '../components/organization/Organization';
import { OrganizationSettings } from '../components/organization/OrganizationSettings';

export const OrganizationTab = () => {
  const canManageOrg = usePermissions(['manage:organization']);
  return (
    <VStack spacing={5} align="left">
      <Organization />
      {canManageOrg && <OrganizationSettings />}
    </VStack>
  );
};
