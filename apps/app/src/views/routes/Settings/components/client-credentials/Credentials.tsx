import { CheckIcon, CopyIcon } from '@chakra-ui/icons';
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
  Divider,
  Button,
  HStack
} from '@chakra-ui/react';

import { usePhoton } from '@photonhealth/react';
import { ClientInfoCard } from './ClientInfoCard';
import { graphql } from 'apps/app/src/gql';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';

const clientsQuery = graphql(/* GraphQL */ `
  query ClientsDeveloperTabQuery {
    clients {
      id
      ...ClientInfoCardFragment
    }
  }
`);

export const Credentials = () => {
  const { getToken } = usePhoton();
  const [tokenClickedState, setTokenClickedState] = useState(false);
  const { clinicalClient } = usePhoton();
  const { data, loading, error } = useQuery(clientsQuery, { client: clinicalClient });
  const clients = useMemo(() => data?.clients, [data?.clients]);

  useEffect(() => {
    if (tokenClickedState) {
      setTimeout(() => {
        setTokenClickedState(false);
      }, 1000);
    }
  }, [tokenClickedState]);

  const getAccessToken = async () => {
    try {
      const token = await getToken();
      navigator.clipboard.writeText(token);
      setTokenClickedState(true);
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <Box p={{ base: '4', md: '8' }} borderRadius="lg" bg="white" boxShadow="base" w="full">
      <Container padding={{ base: '0', md: '0' }}>
        <Box>
          <Stack paddingBottom={5}>
            <HStack justify="space-between">
              <Text fontSize="xl" fontWeight="medium">
                API Credentials
              </Text>
              <Button
                borderColor="blue.500"
                border={'1px'}
                textColor={tokenClickedState ? 'white' : 'blue.500'}
                colorScheme="blue"
                rightIcon={tokenClickedState ? <CheckIcon /> : <CopyIcon />}
                variant={tokenClickedState ? 'solid' : 'outline'}
                onClick={getAccessToken}
                size={'sm'}
              >
                Auth Token
              </Button>
            </HStack>
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
        {clients?.length === 0 && (
          <Text>
            Email us at&nbsp;
            <Link href="mailto:support@photon.health">support@photon.health</Link>
            &nbsp;to request API Credentials for your organization.
          </Text>
        )}
        <Stack spacing={6}>
          {clients?.map((clientCreds, idx) => {
            return (
              <Fragment key={clientCreds.id}>
                <ClientInfoCard clientCreds={clientCreds} />
                {idx !== clients.length - 1 && <Divider />}
              </Fragment>
            );
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
