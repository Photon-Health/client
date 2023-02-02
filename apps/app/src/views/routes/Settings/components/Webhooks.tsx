import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  CircularProgress,
  Center,
  Container,
  Divider,
  HStack,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure
} from '@chakra-ui/react'

import { Outlet } from 'react-router-dom'
import { usePhoton } from '@photonhealth/react'
import { WebhooksForm } from './WebhooksForm'

export const Webhooks = () => {
  const { getWebhooks, deleteWebhook } = usePhoton()
  const { loading, error, webhooks } = getWebhooks()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [onDeleteHandler, { loading: deleteLoading }] = deleteWebhook({
    refetchQueries: ['getWebhooks'],
    awaitRefetchQueries: true
  })

  const onDelete = (id: string) => {
    // eslint-disable-next-line no-alert
    if (window.confirm("Are you sure? You can't undo this action afterwards.")) {
      onDeleteHandler({ variables: { id } })
    }
  }
  return (
    <Box
      py={{ base: '4', md: '8' }}
      px={{ base: '4', md: '8' }}
      borderRadius="lg"
      bg="bg-surface"
      boxShadow="base"
      maxWidth="55em"
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
          {webhooks.length !== 0 && !loading && (
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
                  {webhooks.map((webhook: any) => (
                    <Tr key={webhook.id}>
                      <Td>
                        <Text color="muted">{webhook.url}</Text>
                      </Td>
                      <Td>
                        <Badge size="sm" colorScheme="green">
                          Active
                        </Badge>
                      </Td>
                      <Td textAlign="end">
                        <Button
                          aria-label="Delete"
                          size="sm"
                          variant="outline"
                          borderColor="blue.500"
                          textColor="blue.500"
                          colorScheme="blue"
                          isLoading={deleteLoading}
                          onClick={() => onDelete(webhook.id)}
                        >
                          Delete
                        </Button>
                      </Td>
                    </Tr>
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
  )
}
