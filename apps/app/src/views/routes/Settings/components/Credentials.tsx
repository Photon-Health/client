import {
  Box,
  CircularProgress,
  Link,
  Stack,
  Text,
  Center,
  Alert,
  AlertIcon,
  Container,
  Divider
} from '@chakra-ui/react';

import { usePhoton } from '@photonhealth/react';

import { ClientInfoCard } from './ClientInfoCard';

export const Credentials = () => {
  const { getClients } = usePhoton();
  const { loading, error, clients } = getClients();

  return (
    <Box
      py={{ base: '4', md: '8' }}
      px={{ base: '4', md: '8' }}
      borderRadius="lg"
      bg="bg-surface"
      boxShadow="base"
      maxWidth="45em"
    >
      <Container padding={{ base: '0', md: '0' }}>
        <Box>
          <Stack paddingBottom={5}>
            <Text fontSize="xl" fontWeight="medium">
              API Credentials
            </Text>
            <Divider />
            <Text color="muted" fontSize="md">
              You can execute a client credentials exchange to obtain auth tokens for your
              applications.{' '}
              <Link color="teal.500" href="https://docs.photon.health/docs/authentication">
                Learn More
              </Link>
            </Text>
          </Stack>
        </Box>
        {loading ? (
          <Center padding="100px">
            <CircularProgress isIndeterminate color="green.300" />
          </Center>
        ) : (
          <Text />
        )}
        {clients.length === 0 && (
          <Text>
            Email us at&nbsp;
            <Link href="mailto:support@photon.health">support@photon.health</Link>
            &nbsp;to request API Credentials for your organization.
          </Text>
        )}
        <Stack spacing={6}>
          {clients.map((client: any) => {
            return <ClientInfoCard key={client.id} client={client} />;
          })}
        </Stack>
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error.message}
          </Alert>
        )}
      </Container>
    </Box>
  );
};
