import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Alert,
  AlertIcon,
  Badge,
  Button,
  Divider,
  HStack,
  IconButton,
  Link,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Stack,
  Table,
  TableContainer,
  Tag,
  TagLabel,
  TagLeftIcon,
  Tbody,
  Td,
  Text,
  Tr,
  VStack,
  useBreakpointValue,
  useColorMode
} from '@chakra-ui/react';
import { gql, GraphQLClient } from 'graphql-request';
import { usePhoton, types } from '@photonhealth/react';
import { FiArrowUpRight, FiCheck, FiClock, FiCopy, FiCornerUpRight, FiX } from 'react-icons/fi';

import { Page } from '../components/Page';
import PatientView from '../components/PatientView';
import { confirmWrapper } from '../components/GuardDialog';

import { formatAddress, formatDate, formatFills, formatPhone } from '../../utils';

import { ORDER_FULFILLMENT_COLOR_MAP, ORDER_FULFILLMENT_STATE_MAP } from './Orders';

export const graphQLClient = new GraphQLClient(process.env.REACT_APP_GRAPHQL_URI as string, {
  jsonSerializer: {
    parse: JSON.parse,
    stringify: JSON.stringify
  }
});

export const CANCEL_ORDER = gql`
  mutation cancel($orderId: ID!) {
    cancelOrder(orderId: $orderId) {
      id
    }
  }
`;

const ORDER_FULFILLMENT_TYPE_MAP = {
  [types.FulfillmentType.PickUp]: 'Pick up',
  [types.FulfillmentType.MailOrder]: 'Mail order'
};

const ORDER_STATE_MAP: object = {
  PLACED: 'Placed',
  ROUTING: 'Routing',
  PENDING: 'Pending',
  CANCELED: 'Canceled',
  COMPLETED: 'Completed'
};
const ORDER_STATE_ICON_MAP: any = {
  PLACED: FiArrowUpRight,
  ROUTING: FiCornerUpRight,
  PENDING: FiClock,
  CANCELED: FiX,
  COMPLETED: FiCheck
};

const FILL_STATE_MAP: object = {
  CANCELED: 'Canceled',
  NEW: 'New',
  SCHEDULED: 'Scheduled',
  SENT: 'Sent'
};
const FILL_COLOR_MAP: object = {
  CANCELED: 'gray',
  NEW: 'green',
  SCHEDULED: 'orange',
  SENT: 'yellow'
};

export const Order = () => {
  const params = useParams();
  const id = params.orderId;

  const { getOrder, getToken } = usePhoton();
  const { order, loading, error } = getOrder({ id: id! });
  const [accessToken, setAccessToken] = useState('');

  const getAccessToken = async () => {
    try {
      const token = await getToken();
      setAccessToken(token);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getAccessToken();
  }, []);

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error.message}
      </Alert>
    );
  }

  const isMobile = useBreakpointValue({ base: true, sm: false });
  const rightColWidth = '75%';
  const { colorMode } = useColorMode();

  const CopyText = ({ text }: { text: string }) => {
    if (!text) return null;
    return (
      <HStack spacing={2} justifyContent={isMobile ? 'end' : 'start'}>
        <Text
          fontSize="md"
          whiteSpace={isMobile ? 'nowrap' : undefined}
          overflow={isMobile ? 'hidden' : undefined}
          textOverflow={isMobile ? 'ellipsis' : undefined}
          maxWidth={isMobile ? '100px' : undefined}
        >
          {text}
        </Text>
        <IconButton
          variant="ghost"
          color="gray.500"
          aria-label="Copy external id"
          minW="fit-content"
          h="fit-content"
          py={0}
          my={0}
          _hover={{ backgroundColor: 'transparent' }}
          icon={<FiCopy size="1.3em" />}
          onClick={() => navigator.clipboard.writeText(text || '')}
        />
      </HStack>
    );
  };

  return (
    <Page kicker="Order" header={order ? formatFills(order.fills) : ''} loading={loading}>
      <VStack spacing={4} fontSize={{ base: 'md', md: 'lg' }} alignItems="start" w="100%" mt={0}>
        {loading ? (
          <Skeleton width="112px" height="32px" borderRadius="md" />
        ) : (
          <Button
            size="sm"
            aria-label="Cancel Order"
            isDisabled={order.fulfillment?.type !== types.FulfillmentType.MailOrder}
            onClick={async () => {
              const decision = await confirmWrapper('Cancel this order?', {
                description: 'You will not be able to recover this order.',
                cancelText: "No, Don't Cancel",
                confirmText: 'Yes, Cancel',
                darkMode: colorMode !== 'light',
                colorScheme: 'red'
              });
              if (decision) {
                graphQLClient.setHeader('authorization', accessToken);
                const res = await graphQLClient.request(CANCEL_ORDER, { id });
                console.log(res);
              }
            }}
          >
            Cancel Order
          </Button>
        )}

        <Divider />

        <Stack direction="row" gap={3} w="full">
          <VStack align="start" borderRadius={6} w={isMobile ? '50%' : undefined}>
            <Text color="gray.500" fontWeight="medium" fontSize="sm">
              Patient
            </Text>
            {loading ? (
              <HStack alignContent="center" w="150px" display="flex">
                <SkeletonCircle size="10" />
                <SkeletonText noOfLines={2} flexGrow={1} />
              </HStack>
            ) : (
              <PatientView patient={order.patient} />
            )}
          </VStack>
        </Stack>

        <Divider />

        <Text color="gray.500" fontWeight="medium" fontSize="sm">
          Details
        </Text>

        <TableContainer w="full">
          <Table bg="transparent">
            <Tbody>
              <Tr>
                <Td px={0} py={2} border="none">
                  <Text fontSize="md">Order Status</Text>
                </Td>
                <Td pe={0} py={2} isNumeric={isMobile} border="none" w={rightColWidth}>
                  {loading ? (
                    <Skeleton
                      width="70px"
                      height="24px"
                      borderRadius="xl"
                      ms={isMobile ? 'auto' : undefined}
                    />
                  ) : (
                    <Tag size="sm" borderRadius="full">
                      <TagLeftIcon boxSize="12px" as={ORDER_STATE_ICON_MAP[order.state]} />
                      <TagLabel>{ORDER_STATE_MAP[order.state as keyof object] || ''}</TagLabel>
                    </Tag>
                  )}
                </Td>
              </Tr>
              <Tr>
                <Td px={0} py={2} border="none">
                  <Text fontSize="md">Id</Text>
                </Td>
                <Td pe={0} py={2} isNumeric={isMobile} border="none" w={rightColWidth}>
                  {loading ? (
                    <SkeletonText noOfLines={1} width="150px" ms={isMobile ? 'auto' : undefined} />
                  ) : order.id ? (
                    <CopyText text={order.id} />
                  ) : (
                    <Text fontSize="md" as="i">
                      None
                    </Text>
                  )}
                </Td>
              </Tr>
              <Tr>
                <Td px={0} py={2} border="none">
                  <Text fontSize="md">External Id</Text>
                </Td>
                <Td pe={0} py={2} isNumeric={isMobile} border="none" w={rightColWidth}>
                  {loading ? (
                    <SkeletonText noOfLines={1} width="150px" ms={isMobile ? 'auto' : undefined} />
                  ) : order.externalId ? (
                    <CopyText text={order.externalId} />
                  ) : (
                    <Text fontSize="md" as="i">
                      None
                    </Text>
                  )}
                </Td>
              </Tr>
              <Tr>
                <Td px={0} py={2} border="none">
                  <Text fontSize="md">Created At</Text>
                </Td>
                <Td pe={0} py={2} isNumeric={isMobile} border="none" w={rightColWidth}>
                  {loading ? (
                    <SkeletonText noOfLines={1} width="125px" ms={isMobile ? 'auto' : undefined} />
                  ) : (
                    <Text fontSize="md">{formatDate(order.createdAt)}</Text>
                  )}
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>

        <Divider />

        <Text color="gray.500" fontWeight="medium" fontSize="sm">
          Fulfillment
        </Text>

        <TableContainer w="full">
          <Table bg="transparent">
            <Tbody>
              <Tr>
                <Td px={0} py={2} border="none">
                  <Text fontSize="md">Type</Text>
                </Td>
                <Td pe={0} py={2} isNumeric={isMobile} border="none" w={rightColWidth}>
                  {loading ? (
                    <SkeletonText noOfLines={1} width="100px" ms={isMobile ? 'auto' : undefined} />
                  ) : order.fulfillment ? (
                    <Text fontSize="md">{ORDER_FULFILLMENT_TYPE_MAP[order.fulfillment.type]}</Text>
                  ) : (
                    <Text fontSize="md" as="i">
                      None
                    </Text>
                  )}
                </Td>
              </Tr>
              <Tr>
                <Td px={0} py={2} border="none">
                  <Text fontSize="md">Fulfillment Status</Text>
                </Td>
                <Td pe={0} py={2} isNumeric={isMobile} border="none" w={rightColWidth}>
                  {loading ? (
                    <Skeleton
                      width="70px"
                      height="24px"
                      borderRadius="xl"
                      ms={isMobile ? 'auto' : undefined}
                    />
                  ) : order.fulfillment?.state ? (
                    <Badge
                      size="sm"
                      colorScheme={
                        ORDER_FULFILLMENT_COLOR_MAP[order.fulfillment.state as keyof object] || ''
                      }
                    >
                      {ORDER_FULFILLMENT_STATE_MAP[order.fulfillment.state as keyof object] || ''}
                    </Badge>
                  ) : null}
                </Td>
              </Tr>
              {!loading && order.fulfillment?.type === 'MAIL_ORDER' ? (
                <>
                  <Tr>
                    <Td px={0} py={2} border="none">
                      <Text fontSize="md">Carrier</Text>
                    </Td>
                    <Td pe={0} py={2} isNumeric={isMobile} border="none" w={rightColWidth}>
                      {order.fulfillment?.carrier ? (
                        <Text fontSize="md">{order.fulfillment.carrier}</Text>
                      ) : (
                        <Text fontSize="md" as="i">
                          None
                        </Text>
                      )}
                    </Td>
                  </Tr>
                  <Tr>
                    <Td px={0} py={2} border="none">
                      <Text fontSize="md">Tracking Number</Text>
                    </Td>
                    <Td pe={0} py={2} isNumeric={isMobile} border="none" w={rightColWidth}>
                      {order.fulfillment?.trackingNumber ? (
                        <Text fontSize="md">{order.fulfillment.trackingNumber}</Text>
                      ) : (
                        <Text fontSize="md" as="i">
                          None
                        </Text>
                      )}
                    </Td>
                  </Tr>
                </>
              ) : null}
              <Tr>
                <Td px={0} py={2} border="none">
                  <Text fontSize="md">Pharmacy Id</Text>
                </Td>
                <Td pe={0} py={2} isNumeric={isMobile} border="none" w={rightColWidth}>
                  {loading ? (
                    <SkeletonText noOfLines={1} width="100px" ms={isMobile ? 'auto' : undefined} />
                  ) : order?.pharmacy?.id ? (
                    <CopyText text={order.pharmacy.id} />
                  ) : (
                    <Text fontSize="md" as="i">
                      None
                    </Text>
                  )}
                </Td>
              </Tr>
              <Tr>
                <Td px={0} py={2} border="none">
                  <Text fontSize="md">Pharmacy Name</Text>
                </Td>
                <Td pe={0} py={2} isNumeric={isMobile} border="none" w={rightColWidth}>
                  {loading ? (
                    <SkeletonText noOfLines={1} width="100px" ms={isMobile ? 'auto' : undefined} />
                  ) : order?.pharmacy?.name ? (
                    <Text fontSize="md">{order.pharmacy.name}</Text>
                  ) : (
                    <Text fontSize="md" as="i">
                      None
                    </Text>
                  )}
                </Td>
              </Tr>
              <Tr>
                <Td px={0} py={2} border="none" verticalAlign="top">
                  <Text fontSize="md">Pharmacy Address</Text>
                </Td>
                <Td
                  pe={0}
                  py={2}
                  isNumeric={isMobile}
                  border="none"
                  whiteSpace="normal"
                  w={rightColWidth}
                >
                  {loading ? (
                    <SkeletonText noOfLines={1} width="100px" ms={isMobile ? 'auto' : undefined} />
                  ) : order?.pharmacy?.address ? (
                    <Text fontSize="md">{formatAddress(order.pharmacy.address)}</Text>
                  ) : (
                    <Text fontSize="md" as="i">
                      None
                    </Text>
                  )}
                </Td>
              </Tr>
              <Tr>
                <Td px={0} py={2} border="none">
                  <Text fontSize="md">Pharmacy Phone</Text>
                </Td>
                <Td pe={0} py={2} isNumeric={isMobile} border="none" w={rightColWidth}>
                  {loading ? (
                    <SkeletonText noOfLines={1} width="100px" ms={isMobile ? 'auto' : undefined} />
                  ) : order?.pharmacy?.phone ? (
                    <Link fontSize="md" href={`tel:${order.pharmacy.phone}`} isExternal>
                      {formatPhone(order.pharmacy.phone)}
                    </Link>
                  ) : (
                    <Text fontSize="md" as="i">
                      None
                    </Text>
                  )}
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>

        <Divider />

        <Text color="gray.500" fontWeight="medium" fontSize="sm">
          Fills
        </Text>

        {order?.fills.length > 0 ? (
          <TableContainer w="full">
            <Table bg="transparent" size="sm">
              <Tbody>
                {order.fills.map(({ id: fillId, state, treatment }, i) => {
                  return i < 5 ? (
                    <Tr key={fillId}>
                      <Td px={0} py={3} whiteSpace="pre-wrap" borderColor="gray.200">
                        <HStack w="full" justify="space-between">
                          <VStack alignItems="start">
                            <Text>{treatment.name}</Text>
                            <HStack>
                              <Badge
                                size="sm"
                                colorScheme={FILL_COLOR_MAP[state as keyof object] || ''}
                              >
                                {FILL_STATE_MAP[state as keyof object] || ''}
                              </Badge>
                            </HStack>
                          </VStack>
                        </HStack>
                      </Td>
                    </Tr>
                  ) : null;
                })}
              </Tbody>
            </Table>
          </TableContainer>
        ) : (
          <Text as="i">No fills</Text>
        )}
      </VStack>
    </Page>
  );
};
