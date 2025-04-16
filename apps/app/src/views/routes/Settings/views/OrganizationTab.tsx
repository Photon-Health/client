import { VStack } from '@chakra-ui/react';

import { Organization } from '../components/organization/Organization';
import { OrganizationSettings } from '../components/organization/OrganizationSettings';
import { usePhoton } from '@photonhealth/react';

// Boson and Neutron test org ids
const settingsTestOrgs = new Set(['org_KzSVZBQixLRkqj5d', 'org_kVS7AP4iuItESdMA']);

export const OrganizationTab = () => {
  const { getOrganization } = usePhoton();
  const { organization } = getOrganization();
  return (
    <VStack spacing={5} align="left">
      <Organization />
      {settingsTestOrgs.has(organization?.id) && <OrganizationSettings />}
    </VStack>
  );
};
