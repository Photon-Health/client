import { HStack, TabPanel, TabPanels, Tab, TabList, Tabs, Button, Link } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { usePhoton } from '@photonhealth/react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Page } from '../../components/Page';
import { ColorModeSwitcher } from '../../components/ColorModeSwitcher';
import { Auth } from '../../components/Auth';
import { TemplateTab } from './views/TemplateTab';
import { TreatmentTab } from './views/TreatmentTab';
import { UserTab } from './views/UserTab';
import { AddIcon } from '@chakra-ui/icons';

const Buttons = ({ orgId, orgName }: { orgId: string; orgName: string }) => (
  <HStack>
    <Link
      href={`https://fxr8djfdbq8.typeform.com/to/awCi4YTp#org_id=${orgId}&org_name=${orgName}`}
      isExternal
    >
      <Button
        borderColor="blue.500"
        textColor="blue.500"
        colorScheme="blue"
        rightIcon={<AddIcon />}
        variant="outline"
      >
        Add a Provider
      </Button>
    </Link>
    <Auth />
    <ColorModeSwitcher />
  </HStack>
);

export const Settings = () => {
  const { getOrganization } = usePhoton();
  const organization = getOrganization();
  const [tabIndex, setTabIndex] = useState(0);

  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    switch (pathname) {
      case '/settings/user':
        setTabIndex(0);
        break;
      case '/settings/templates':
        setTabIndex(1);
        break;
      case '/settings/catalog':
        setTabIndex(2);
        break;
      default:
        navigate('/settings/user');
        break;
    }
  }, [pathname]);

  const handleTabsChange = (index: number) => {
    setTabIndex(index);
    switch (index) {
      case 0:
        navigate('/settings/user');
        break;
      case 1:
        navigate('/settings/templates');
        break;
      case 2:
        navigate('/settings/catalog');
        break;
      default:
        break;
    }
  };
  console.log('organization', organization);
  return (
    <Page
      header="Settings"
      buttons={
        <Buttons
          orgId={organization?.organization?.id}
          orgName={organization?.organization?.name}
        />
      }
    >
      <Tabs index={tabIndex} onChange={handleTabsChange}>
        <TabList>
          <Tab>User</Tab>
          <Tab>Templates</Tab>
          <Tab>Catalog</Tab>
        </TabList>
        <TabPanels>
          <TabPanel display="flex" flexDir="column" gap="4" px={0}>
            <UserTab />
          </TabPanel>
          <TabPanel display="flex" flexDir="column" gap="4">
            {/* Remember to move this table/form split layout to a component */}
            <TemplateTab organization={organization} />
          </TabPanel>
          <TabPanel display="flex" flexDir="column" gap="4">
            <TreatmentTab organization={organization} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Page>
  );
};
