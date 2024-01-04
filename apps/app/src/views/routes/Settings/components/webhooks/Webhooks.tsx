import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Center,
  CircularProgress,
  Container,
  Divider,
  HStack,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure
} from '@chakra-ui/react';

import { useQuery } from '@apollo/client';
import { graphql } from 'apps/app/src/gql';
import { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { useClinicalApiClient } from '../../../../../clinicalApollo';
import { WebhookItem } from './WebhookItem';
import { WebhooksForm } from './WebhooksForm';

const webhookListQuery = graphql(/* GraphQL */ `
  query WebhookListQuery {
    webhooks {
      id
      ...WebhookItemFragment
    }
  }
`);

export const Webhooks = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const client = useClinicalApiClient();
  const { data, loading, error } = useQuery(webhookListQuery, { client });
  const webhooks = useMemo(() => data?.webhooks, [data?.webhooks]);

  return (
    <Box
      pt={{ base: '4', md: '4' }}
      pb={{ base: '4', md: '8' }}
      px={{ base: '4', md: '8' }}
      borderRadius="lg"
      bg="bg-surface"
      boxShadow="base"
    >
      <Container padding={{ base: '0', md: '0' }}>
        <Stack spacing={3}>
          <HStack justify="space-between">
            <Text fontSize="xl" fontWeight="medium">
              Webhooks
            </Text>
            <Button onClick={onOpen} colorScheme="blue" aria-label="Add Webhook" disabled={isOpen}>
              Add webhook
            </Button>
          </HStack>
          <Divider />
          <Text color="muted" fontSize="md">
            Webhooks allow external services to be notified when certain events happen. When the
            specified events happen, we'll send a POST request to each of the URLs you profile.
          </Text>
          <Outlet />
          {loading && (
            <Center padding="100px">
              <CircularProgress isIndeterminate color="green.300" />
            </Center>
          )}
          <WebhooksForm isOpen={isOpen} close={onClose} />
          {webhooks?.length !== 0 && !loading && (
            <TableContainer paddingTop={3}>
              <Table variant="unstyled" size="sm">
                <Thead>
                  <Tr>
                    <Th>URL</Th>
                    <Th>Status</Th>
                    <Th />
                  </Tr>
                </Thead>
                <Tbody>
                  {webhooks?.map((webhook) => (
                    <WebhookItem webhook={webhook} key={webhook.id} />
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}
          {error && (
            <Alert status="error">
              <AlertIcon />
              {error.message}
            </Alert>
          )}
        </Stack>
      </Container>
    </Box>
  );
};
