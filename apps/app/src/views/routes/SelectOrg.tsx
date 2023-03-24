import {
  Box,
  Button,
  Center,
  CircularProgress,
  Container,
  Divider,
  HStack,
  Stack,
  Text,
  useColorModeValue
} from '@chakra-ui/react';

import { FiLogIn } from 'react-icons/fi';

import { useLocation } from 'react-router-dom';
import { usePhoton } from '@photonhealth/react';
import { useEffect } from 'react';

export const SelectOrg = () => {
  const location = useLocation();

  const from = `${(location.pathname || '/') + (location.search || '')}`;

  const { login, logout, getOrganizations, setOrganization } = usePhoton();
  const { organizations, loading } = getOrganizations();

  useEffect(() => {
    if (!loading) {
      if (organizations?.length === 0) {
        logout({ returnTo: `${window.location.origin}?orgs=0` });
      } else if (organizations?.length === 1) {
        setOrganization(organizations[0].id);
        login({
          appState: {
            returnTo: from
          }
        });
      }
    }
  }, [organizations, loading]);

  const orgs = (organizations || []).map((organization: any) => {
    const { id, name } = organization;

    return (
      <Container key={name} variant="outline" padding={{ base: '0', md: '0' }}>
        <Stack spacing={3}>
          <HStack justify="space-between">
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
                  appState: {
                    returnTo: from
                  }
                });
              }}
            >
              Select
            </Button>
          </HStack>
        </Stack>
      </Container>
    );
  });

  return (
    <Box as="section" height="100vh" overflowY="auto">
      {loading && (
        <Center padding="1.5em" height="100vh">
          <CircularProgress isIndeterminate color="green.300" />
        </Center>
      )}
      {organizations?.length > 1 && (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          as="section"
          pt={{ base: '4', md: '8' }}
          pb={{ base: '12', md: '24' }}
        >
          <Box
            bg="bg-surface"
            px={{ base: '4', md: '6' }}
            py="5"
            boxShadow={useColorModeValue('sm', 'sm-dark')}
            borderTopWidth="4px"
            borderColor="accent"
          >
            <Stack spacing="3">
              <Text fontSize="lg" fontWeight="medium">
                Select an organization
              </Text>
              <Text color="muted" fontSize="sm">
                You are a member of multiple organizations. Please choose the organization you would
                like to log in to.
              </Text>
              <Divider />
              {orgs}
            </Stack>
          </Box>
        </Box>
      )}
    </Box>
  );
};
