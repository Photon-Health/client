import {
  Button,
  Center,
  CircularProgress,
  HStack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useQuery } from '@apollo/client';
import { AddIcon } from '@chakra-ui/icons';
import { graphql } from 'apps/app/src/gql';
import usePermissions from 'apps/app/src/hooks/usePermissions';
import { Page } from '../../components/Page';
import { useClinicalApiClient } from './apollo';
import { InviteForm } from './components/invites/InviteForm';
import { DevelopersTab } from './views/DevelopersTab';
import { OrganizationTab } from './views/OrganizationTab';
import { TeamTab } from './views/TeamTab';
import { TemplateTab } from './views/TemplateTab';
import { TreatmentTab } from './views/TreatmentTab';
import { UserTab } from './views/UserTab';

const settingsPageQuery = graphql(/* GraphQL */ `
  query SettingsPageQuery {
    me {
      roles {
        id
      }
    }
    organization {
      id
      name
      ...OrganizationTreatmentTabFragment
      ...OrganizationTemplateTabFragment
    }
    roles {
      name
      id
    }
  }
`);

const AddProviderButton = ({ disabled = false }: { disabled?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button
        borderColor="blue.500"
        textColor="blue.500"
        colorScheme="blue"
        rightIcon={<AddIcon />}
        variant="outline"
        disabled={disabled}
        opacity={disabled ? 0.2 : 1}
        onClick={() => setIsOpen(true)}
      >
        Add a Provider
      </Button>
      <InviteForm isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

const Buttons = ({ orgId, hasInvite }: { orgId: string | undefined; hasInvite: boolean }) => (
  <HStack>
    {hasInvite && <AddProviderButton disabled={orgId == null} />}
    {/* <Auth /> */}
  </HStack>
);

const tabs = [
  '/settings/user',
  '/settings/team',
  '/settings/organization',
  '/settings/developers',
  '/settings/templates',
  '/settings/catalog'
] as const;

const canNavigate = (
  route: (typeof tabs)[number],
  { hasDeveloper, hasTeam, hasOrg }: { hasDeveloper: boolean; hasTeam: boolean; hasOrg: boolean }
) => {
  if (route === '/settings/developers') return hasDeveloper;
  if (route === '/settings/team') return hasTeam;
  if (route === '/settings/organization') return hasOrg;
  return true;
};

export const Settings = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const client = useClinicalApiClient();
  const { data, loading } = useQuery(settingsPageQuery, { client });

  const rolesMap: Record<string, string> = useMemo(
    () =>
      data?.roles
        ? Object.fromEntries(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            data.roles.filter((r) => r.name != null).map(({ id, name }) => [id, name!])
          )
        : {},
    [data?.roles]
  );

  const hasDeveloper = usePermissions(['read:client']);
  const hasTeam = usePermissions(['read:profile']);
  const hasInvite = usePermissions(['write:invite']);
  const hasOrg = usePermissions(['read:organization']);

  useEffect(() => {
    if (loading) {
      // Don't do anything until we've loaded
      return;
    }
    const newTabIndex = tabs.findIndex((path) => path === pathname);
    const newTabRoute = tabs[newTabIndex];

    if (newTabIndex >= 0 && canNavigate(newTabRoute, { hasDeveloper, hasTeam, hasOrg })) {
      setTabIndex(newTabIndex);
    } else {
      navigate(tabs[0]);
    }
  }, [pathname, loading]);

  const handleTabsChange = (index: number) => {
    const newPath = tabs[index];
    if (!canNavigate(newPath, { hasDeveloper, hasOrg, hasTeam })) return;
    setTabIndex(index);
    if (newPath) {
      navigate(newPath);
    }
  };

  return (
    <Page
      header="Settings"
      buttons={<Buttons orgId={data?.organization?.id} hasInvite={hasInvite} />}
    >
      {loading ? (
        <Center padding="100px">
          <CircularProgress isIndeterminate color="green.300" />
        </Center>
      ) : (
        <Tabs index={tabIndex} onChange={handleTabsChange} isLazy maxWidth="100%">
          <TabList overflowX={'auto'}>
            <Tab>User</Tab>
            <Tab hidden={!hasTeam}>Team</Tab>
            <Tab hidden={!hasOrg}>Organization</Tab>
            <Tab hidden={!hasDeveloper}>Developers</Tab>
            <Tab>Templates</Tab>
            <Tab>Catalog</Tab>
          </TabList>
          <TabPanels>
            <TabPanel display="flex" flexDir="column" gap="4" px={0}>
              <UserTab />
            </TabPanel>
            <TabPanel display="flex" flexDir="column" gap="4" px={0}>
              <TeamTab rolesMap={rolesMap} />
            </TabPanel>
            <TabPanel display="flex" flexDir="column" gap="4" px={0}>
              <OrganizationTab />
            </TabPanel>
            <TabPanel display="flex" flexDir="column" gap="4" px={0}>
              <DevelopersTab />
            </TabPanel>
            <TabPanel display="flex" flexDir="column" gap="4">
              <TemplateTab organizationFragment={data?.organization ?? undefined} />
            </TabPanel>
            <TabPanel display="flex" flexDir="column" gap="4">
              <TreatmentTab organization={data?.organization ?? undefined} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}
    </Page>
  );
};
