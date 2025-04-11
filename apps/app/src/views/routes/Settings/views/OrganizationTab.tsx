import { VStack } from '@chakra-ui/react';

import { Organization } from '../components/organization/Organization';
import { OrganizationSettings } from '../components/organization/OrganizationSettings';
import { usePhoton } from '@photonhealth/react';

export const OrganizationTab = () => {
  const { getOrganization } = usePhoton();
  const { organization } = getOrganization();
  return (
    <VStack spacing={5} align="left">
      <Organization />
      {organization?.id === 'org_KzSVZBQixLRkqj5d' && <OrganizationSettings />}
    </VStack>
  );
};
