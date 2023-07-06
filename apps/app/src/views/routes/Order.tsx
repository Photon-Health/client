import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
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
  useColorMode,
  useToast
} from '@chakra-ui/react';
import { gql, GraphQLClient } from 'graphql-request';
import { usePhoton, types } from '@photonhealth/react';
import {
  FiArrowUpRight,
  FiCheck,
  FiClock,
  FiCopy,
  FiCornerUpRight,
  FiX,
  FiChevronRight
} from 'react-icons/fi';

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
  mutation cancel($id: ID!) {
    cancelOrder(id: $id) {
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
  const toast = useToast();
  const params = useParams();
  const id = params.orderId;
  const navigate = useNavigate();

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
    if (!accessToken) {
      getAccessToken();
    }
  }, [accessToken]);

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

  if (error || (!loading && !order)) {
    return (
      <Alert
        status="warning"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        height="200px"
      >
        <AlertIcon />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          Unknown Order
        </AlertTitle>
        <AlertDescription maxWidth="sm">
          <div>Looks like we can't find an order with that ID. </div>
          <Link textDecoration="underline" fontSize="md" href="/orders">
            Go back to orders.
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  const buttons = loading ? (
    <Skeleton width="130px" height="42px" borderRadius="md" />
  ) : (
    <Button
      aria-label="Cancel Order"
      variant="outline"
      borderColor="blue.500"
      textColor="blue.500"
      colorScheme="blue"
      isDisabled={
        order.fulfillment?.type !== types.FulfillmentType.MailOrder ||
        order.state === types.OrderState.Canceled
      }
      onClick={async () => {
        const decision = await confirmWrapper('Cancel this order?', {
          description: 'You will not be able to undo this action.',
          cancelText: "No, Don't Cancel",
          confirmText: 'Yes, Cancel',
          darkMode: colorMode !== 'light',
          colorScheme: 'red'
        });
        if (decision) {
          graphQLClient.setHeader('authorization', accessToken);
          const res = await graphQLClient.request(CANCEL_ORDER, { id });
          if (res) {
            toast({
              title: 'Order canceled',
              status: 'success',
              duration: 5000
            });
          }
        }
      }}
    >
      Cancel Order
    </Button>
  );

  return (
    <Page header="Order" buttons={buttons}>
      <Card>
        <CardHeader>
          <Text fontWeight="medium">
            {loading ? <Skeleton height="30px" width="250px" /> : formatFills(order.fills)}
          </Text>
        </CardHeader>
        <Divider color="gray.100" />
        <CardBody>
          <VStack
            spacing={4}
            fontSize={{ base: 'md', md: 'lg' }}
            alignItems="start"
            w="100%"
            mt={0}
          >
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
                        <SkeletonText
                          noOfLines={1}
                          width="150px"
                          ms={isMobile ? 'auto' : undefined}
                        />
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
                        <SkeletonText
                          noOfLines={1}
                          width="150px"
                          ms={isMobile ? 'auto' : undefined}
                        />
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
                        <SkeletonText
                          noOfLines={1}
                          width="125px"
                          ms={isMobile ? 'auto' : undefined}
                        />
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
                        <SkeletonText
                          noOfLines={1}
                          width="100px"
                          ms={isMobile ? 'auto' : undefined}
                        />
                      ) : order.fulfillment ? (
                        <Text fontSize="md">
                          {ORDER_FULFILLMENT_TYPE_MAP[order.fulfillment.type]}
                        </Text>
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
                            ORDER_FULFILLMENT_COLOR_MAP[order.fulfillment.state as keyof object] ||
                            ''
                          }
                        >
                          {ORDER_FULFILLMENT_STATE_MAP[order.fulfillment.state as keyof object] ||
                            ''}
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
                        <SkeletonText
                          noOfLines={1}
                          width="100px"
                          ms={isMobile ? 'auto' : undefined}
                        />
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
                        <SkeletonText
                          noOfLines={1}
                          width="100px"
                          ms={isMobile ? 'auto' : undefined}
                        />
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
                        <SkeletonText
                          noOfLines={1}
                          width="100px"
                          ms={isMobile ? 'auto' : undefined}
                        />
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
                        <SkeletonText
                          noOfLines={1}
                          width="100px"
                          ms={isMobile ? 'auto' : undefined}
                        />
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
                    {order.fills.map((fill: any, i: number) => {
                      return i < 5 ? (
                        <Tr
                          key={fill.id}
                          onClick={() => navigate(`/prescriptions/${fill?.prescription?.id}`)}
                          _hover={{ backgroundColor: 'gray.100' }}
                          cursor="pointer"
                        >
                          <Td px={0} py={3} whiteSpace="pre-wrap" borderColor="gray.200">
                            <HStack w="full" justify="space-between">
                              <VStack alignItems="start">
                                <HStack>
                                  <Text>{fill.treatment.name}</Text>
                                </HStack>
                                <HStack>
                                  <Badge
                                    size="sm"
                                    colorScheme={FILL_COLOR_MAP[fill.state as keyof object] || ''}
                                  >
                                    {FILL_STATE_MAP[fill.state as keyof object] || ''}
                                  </Badge>
                                </HStack>
                              </VStack>
                              <Box alignItems="end">
                                <FiChevronRight size="1.3em" />
                              </Box>
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
        </CardBody>
      </Card>
    </Page>
  );
};
