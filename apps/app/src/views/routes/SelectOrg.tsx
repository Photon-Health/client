import {
  Button,
  Card,
  Center,
  CircularProgress,
  Container,
  Divider,
  HStack,
  Stack,
  Text
} from '@chakra-ui/react';

import { FiLogIn } from 'react-icons/fi';

import { useLocation, useSearchParams } from 'react-router-dom';
import { usePhoton } from '@photonhealth/react';
import { useEffect } from 'react';

export const SelectOrg = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const from = `${(location.pathname || '/') + (location.search || '')}`;

  const { login, logout, getOrganizations, setOrganization } = usePhoton();
  const { organizations, loading } = getOrganizations();

  useEffect(() => {
    if (!loading) {
      if (organizations?.length === 0) {
        const queryString = location.search.replace(/^\?/, '');
        const searchParams = new URLSearchParams(queryString);
        searchParams.append('orgs', '0');

        if (location?.pathname && location?.pathname !== '/') {
          searchParams.append('pathname', location.pathname);
        }

        logout({ returnTo: `${window.location.origin}?${searchParams.toString()}` });
      } else if (organizations?.length === 1) {
        setOrganization(organizations[0].id);
        login({
          appState: {
            returnTo: from
          },
          organizationId: organizations[0].id
        });
      }
    }
  }, [organizations, loading]);

  useEffect(() => {
    if (searchParams.has('orgs')) {
      searchParams.delete('orgs');
      searchParams.delete('pathname');
      setSearchParams(searchParams);
    }
  }, []);

  const orgs = (organizations || []).map((organization: any) => {
    const { id, name } = organization;

    return (
      <HStack key={name} justify="space-between">
        <Text fontSize="lg" fontWeight="medium">
          {name.charAt(0).toUpperCase() + name.slice(1)}
        </Text>
        <Button
          key={id}
          size="sm"
          variant="primary"
          rightIcon={<FiLogIn />}
          value={id}
          onClick={() => {
            setOrganization(id);
            login({
              organizationId: id,
              appState: {
                returnTo: from
              }
            });
          }}
        >
          Select
        </Button>
      </HStack>
    );
  });

  if (loading) {
    return (
      <Center padding="1.5em" height="100vh">
        <CircularProgress isIndeterminate color="green.300" />
      </Center>
    );
  }

  return (
    <Container maxW="2xl">
      {organizations?.length > 1 && (
        <Card p={5} mt={5} borderTopWidth="4px" borderColor="accent">
          <Stack spacing="3">
            <Text fontSize="lg" fontWeight="medium" alignSelf="center">
              Select an organization
            </Text>
            <Text color="muted" fontSize="sm" alignSelf="center">
              You are a member of multiple organizations. Please choose the organization you would
              like to log in to.
            </Text>
            <Divider />
            {orgs}
          </Stack>
        </Card>
      )}
    </Container>
  );
};
