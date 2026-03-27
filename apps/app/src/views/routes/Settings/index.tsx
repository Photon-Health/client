import {
  Center,
  CircularProgress,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs
} from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useQuery } from '@apollo/client';
import { graphql } from 'apps/app/src/gql';
import usePermissions from 'apps/app/src/hooks/usePermissions';
import { Page } from '../../components/Page';
import { usePhoton } from '@photonhealth/react';
import { DashboardTab } from './views/DashboardTab';
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
    }
    roles {
      name
      id
    }
  }
`);

const tabs = [
  '/settings/team',
  '/settings/user',
  '/settings/organization',
  '/settings/developers',
  '/settings/catalog',
  '/settings/templates',
  '/settings/dashboard'
] as const;

const canNavigate = (
  route: (typeof tabs)[number],
  {
    hasDeveloper,
    hasTeam,
    canManageOrganization
  }: {
    hasDeveloper: boolean;
    hasTeam: boolean;
    canManageOrganization: boolean;
  }
) => {
  if (route === '/settings/developers') return hasDeveloper;
  if (route === '/settings/team') return hasTeam;
  if (route === '/settings/organization') return canManageOrganization;
  if (route === '/settings/dashboard') return canManageOrganization;
  return true;
};

export const Settings = () => {
  const [tabIndex, setTabIndex] = useState<number | undefined>();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const { clinicalClient } = usePhoton();
  const { data, loading } = useQuery(settingsPageQuery, { client: clinicalClient });

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
  const canManageOrganization = usePermissions(['manage:organization']);

  useEffect(() => {
    if (loading) {
      // Don't do anything until we've loaded
      return;
    }
    const newTabIndex = tabs.findIndex((path) => path === pathname);
    const newTabRoute = tabs[newTabIndex];

    if (
      newTabIndex >= 0 &&
      canNavigate(newTabRoute, { hasDeveloper, hasTeam, canManageOrganization })
    ) {
      setTabIndex(newTabIndex);
    } else {
      // Find the first page they can navigate to
      const firstEligible = tabs.find((route) =>
        canNavigate(route, { hasDeveloper, hasTeam, canManageOrganization })
      );
      navigate(firstEligible ?? tabs[1]);
    }
  }, [pathname, loading, hasDeveloper, hasTeam, canManageOrganization]);

  const handleTabsChange = (index: number) => {
    const newPath = tabs[index];
    if (!canNavigate(newPath, { hasDeveloper, hasTeam, canManageOrganization })) return;
    setTabIndex(index);
    if (newPath) {
      navigate(newPath);
    }
  };

  return (
    <Page header="Settings">
      {/* Show loading spinner until the correct tab index has been resolved */}
      {loading || tabIndex == null ? (
        <Center padding="100px">
          <CircularProgress isIndeterminate color="green.300" />
        </Center>
      ) : (
        <Tabs index={tabIndex} onChange={handleTabsChange} isLazy maxWidth="100%">
          <TabList overflowX={'auto'} overflowY={'hidden'}>
            <Tab hidden={!hasTeam}>Team</Tab>
            <Tab>User</Tab>
            <Tab hidden={!canManageOrganization}>Organization</Tab>
            <Tab hidden={!hasDeveloper}>Developers</Tab>
            <Tab>Catalog</Tab>
            <Tab>Templates</Tab>
            <Tab hidden={!canManageOrganization}>Dashboard</Tab>
          </TabList>
          <TabPanels>
            <TabPanel display="flex" flexDir="column" gap={{ md: '4' }} px={0}>
              <TeamTab rolesMap={rolesMap} />
            </TabPanel>
            <TabPanel display="flex" flexDir="column" gap={{ md: '4' }} px={0}>
              <UserTab />
            </TabPanel>
            <TabPanel display="flex" flexDir="column" gap={{ md: '4' }} px={0}>
              <OrganizationTab />
            </TabPanel>
            <TabPanel display="flex" flexDir="column" gap={{ md: '4' }} px={0}>
              <DevelopersTab />
            </TabPanel>
            <TabPanel display="flex" flexDir="column" gap={{ md: '4' }} px={0}>
              <TreatmentTab organization={data?.organization ?? undefined} />
            </TabPanel>
            <TabPanel display="flex" flexDir="column" gap={{ md: '4' }} px={0}>
              <TemplateTab />
            </TabPanel>
            <TabPanel display="flex" flexDir="column" gap={{ md: '4' }} px={0}>
              <DashboardTab />
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}
    </Page>
  );
};
