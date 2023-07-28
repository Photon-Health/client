import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  HStack,
  Link,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Stack,
  Text,
  VStack,
  useBreakpointValue,
  useColorMode,
  LinkBox,
  LinkOverlay,
  Tag,
  TagLeftIcon,
  TagLabel
} from '@chakra-ui/react';
import { gql, GraphQLClient } from 'graphql-request';
import { usePhoton, types } from '@photonhealth/react';
import { FiChevronRight } from 'react-icons/fi';
import { Page } from '../components/Page';
import PatientView from '../components/PatientView';
import { confirmWrapper } from '../components/GuardDialog';
import { formatAddress, formatDate, formatFills, formatPhone } from '../../utils';
import {
  OrderFulfillmentState,
  ORDER_FULFILLMENT_COLOR_MAP,
  ORDER_FULFILLMENT_STATE_MAP,
  ORDER_STATE_COLOR_MAP,
  ORDER_STATE_ICON_MAP,
  ORDER_STATE_MAP
} from '../components/OrderStatusBadge';
import InfoGrid from '../components/InfoGrid';
import CopyText from '../components/CopyText';
import { OrderState } from 'packages/sdk/dist/types';
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
export const ORDER_FULFILLMENT_TYPE_MAP = {
  [types.FulfillmentType.PickUp]: 'Pick up',
  [types.FulfillmentType.MailOrder]: 'Mail order'
};

const CancelOrderAlert = ({
  orderState,
  fulfillmentState
}: {
  orderState: OrderState;
  fulfillmentState: OrderFulfillmentState;
}) => {
  if (orderState === types.OrderState.Canceled) {
    return (
      <Alert colorScheme="gray">
        <AlertIcon />
        This order has been canceled
      </Alert>
    );
  }
  if (orderState === types.OrderState.Completed) {
    return (
      <Alert colorScheme="gray">
        <AlertIcon />
        This order has been completed
      </Alert>
    );
  }
  if (fulfillmentState === 'PICKED_UP') {
    return (
      <Alert status="warning">
        <AlertIcon />
        This order has been picked up, but we can't cancel the remaining fills. Please call the
        pharmacy.
      </Alert>
    );
  }
  if (fulfillmentState === 'RECEIVED' || fulfillmentState === 'READY') {
    return (
      <Alert status="warning">
        <AlertIcon />
        This order may have been picked up, but we can cancel the remaining fills.
      </Alert>
    );
  }
  return null;
};

export const Order = () => {
  const params = useParams();
  const id = params.orderId;
  const { getOrder, getToken } = usePhoton();
  const { order, loading, error } = getOrder({ id: id! });
  const [accessToken, setAccessToken] = useState('');
  const [canceling, setCanceling] = useState(false);

  const navigate = useNavigate();
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
  const { colorMode } = useColorMode();

  const prescriptions = useMemo(() => {
    if (!order) return [];

    const rxIds = new Set();
    return order.fills.filter((fill: any) => {
      if (rxIds.has(fill.prescription.id)) return false;
      rxIds.add(fill.prescription.id);
      return true;
    });
  }, [order]);

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

  return (
    <Page header="Order">
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
                    <SkeletonText skeletonHeight={5} noOfLines={2} flexGrow={1} />
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

            <InfoGrid name="Order Status">
              {loading ? (
                <Skeleton width="70px" height="24px" borderRadius="xl" />
              ) : (
                <Tag
                  size="sm"
                  borderRadius="full"
                  colorScheme={ORDER_STATE_COLOR_MAP[order.state as OrderState]}
                >
                  <TagLeftIcon boxSize="12px" as={ORDER_STATE_ICON_MAP[order.state]} />
                  <TagLabel>{ORDER_STATE_MAP[order.state as keyof object] || ''}</TagLabel>
                </Tag>
              )}
            </InfoGrid>

            <InfoGrid name="Id">
              {loading ? (
                <SkeletonText skeletonHeight={5} noOfLines={1} width="150px" />
              ) : order.id ? (
                <CopyText text={order.id} />
              ) : (
                <Text fontSize="md" as="i">
                  None
                </Text>
              )}
            </InfoGrid>

            <InfoGrid name="External Id">
              {loading ? (
                <SkeletonText skeletonHeight={5} noOfLines={1} width="150px" />
              ) : order.externalId ? (
                <CopyText text={order.externalId} />
              ) : (
                <Text fontSize="md" as="i">
                  None
                </Text>
              )}
            </InfoGrid>

            <InfoGrid name="Created At">
              {loading ? (
                <SkeletonText skeletonHeight={5} noOfLines={1} width="125px" />
              ) : (
                <Text fontSize="md">{formatDate(order.createdAt)}</Text>
              )}
            </InfoGrid>

            <Divider />

            <Text color="gray.500" fontWeight="medium" fontSize="sm">
              Fulfillment
            </Text>

            <InfoGrid name="Type">
              {loading ? (
                <SkeletonText skeletonHeight={5} noOfLines={1} width="100px" />
              ) : order.fulfillment ? (
                <Text fontSize="md">{ORDER_FULFILLMENT_TYPE_MAP[order.fulfillment.type]}</Text>
              ) : (
                <Text fontSize="md" as="i">
                  None
                </Text>
              )}
            </InfoGrid>

            <InfoGrid name="Fulfillment Status">
              {loading ? (
                <Skeleton width="70px" height="24px" borderRadius="xl" />
              ) : order.fulfillment?.state ? (
                <Tag
                  size="sm"
                  borderRadius="full"
                  colorScheme={
                    ORDER_FULFILLMENT_COLOR_MAP[order.fulfillment.state as keyof object] || ''
                  }
                >
                  <TagLabel>
                    {ORDER_FULFILLMENT_STATE_MAP[order.fulfillment.state as keyof object] || ''}
                  </TagLabel>
                </Tag>
              ) : null}
            </InfoGrid>

            {!loading && order.fulfillment?.type === 'MAIL_ORDER' ? (
              <>
                <InfoGrid name="Carrier">
                  {order.fulfillment?.carrier ? (
                    <Text fontSize="md">{order.fulfillment.carrier}</Text>
                  ) : (
                    <Text fontSize="md" as="i">
                      None
                    </Text>
                  )}
                </InfoGrid>
                <InfoGrid name="Tracking Number">
                  {order.fulfillment?.trackingNumber ? (
                    <Text fontSize="md">{order.fulfillment.trackingNumber}</Text>
                  ) : (
                    <Text fontSize="md" as="i">
                      None
                    </Text>
                  )}
                </InfoGrid>
              </>
            ) : null}

            <InfoGrid name="Pharmacy Id">
              {loading ? (
                <SkeletonText skeletonHeight={5} noOfLines={1} width="100px" />
              ) : order?.pharmacy?.id ? (
                <CopyText text={order.pharmacy.id} />
              ) : (
                <Text fontSize="md" as="i">
                  None
                </Text>
              )}
            </InfoGrid>

            <InfoGrid name="Pharmacy Name">
              {loading ? (
                <SkeletonText skeletonHeight={5} noOfLines={1} width="100px" />
              ) : order?.pharmacy?.name ? (
                <Text fontSize="md">{order.pharmacy.name}</Text>
              ) : (
                <Text fontSize="md" as="i">
                  None
                </Text>
              )}
            </InfoGrid>

            <InfoGrid name="Pharmacy Address">
              {loading ? (
                <SkeletonText skeletonHeight={5} noOfLines={1} width="100px" />
              ) : order?.pharmacy?.address ? (
                <Text fontSize="md">{formatAddress(order.pharmacy.address)}</Text>
              ) : (
                <Text fontSize="md" as="i">
                  None
                </Text>
              )}
            </InfoGrid>

            <InfoGrid name="Pharmacy Phone">
              {loading ? (
                <SkeletonText skeletonHeight={5} noOfLines={1} width="100px" />
              ) : order?.pharmacy?.phone ? (
                <Link fontSize="md" href={`tel:${order.pharmacy.phone}`} isExternal>
                  {formatPhone(order.pharmacy.phone)}
                </Link>
              ) : (
                <Text fontSize="md" as="i">
                  None
                </Text>
              )}
            </InfoGrid>

            <Divider />

            <Text color="gray.500" fontWeight="medium" fontSize="sm">
              Fills
            </Text>
            {prescriptions.length > 0 ? (
              <>
                {prescriptions.map((fill: any, i: number) => {
                  return i < 5 ? (
                    <LinkBox key={fill.id} w="full" style={{ textDecoration: 'none' }}>
                      <Card
                        variant="outline"
                        p={[2, 3]}
                        w="full"
                        shadow="none"
                        _hover={{
                          backgroundColor: 'gray.50'
                        }}
                      >
                        <HStack justifyContent="space-between">
                          <VStack alignItems="start">
                            <HStack>
                              <LinkOverlay href={`/prescriptions/${fill?.prescription?.id}`}>
                                <Text>{fill.treatment.name}</Text>
                              </LinkOverlay>
                            </HStack>
                            <Stack direction={['column', 'row']}>
                              <Text fontSize="xs" color="gray.500">
                                Fill ID: {fill.id}
                              </Text>
                            </Stack>
                          </VStack>

                          <Box alignItems="end">
                            <FiChevronRight size="1.3em" />
                          </Box>
                        </HStack>
                      </Card>
                    </LinkBox>
                  ) : null;
                })}
              </>
            ) : (
              <Text as="i">No fills</Text>
            )}

            <Divider />

            <Text color="gray.500" fontWeight="medium" fontSize="sm">
              Actions
            </Text>
            <Text>
              Canceling an order will send a cancellation notification to the pharmacy for any fills
              already sent to the pharmacy.
            </Text>
            {!loading ? (
              <CancelOrderAlert
                orderState={order.state as OrderState}
                fulfillmentState={order?.fulfillment?.state as OrderFulfillmentState}
              />
            ) : null}

            <Button
              aria-label="Cancel Order"
              variant="outline"
              borderColor="red.500"
              textColor="red.500"
              colorScheme="red"
              size="sm"
              isLoading={canceling}
              loadingText="Canceling..."
              isDisabled={
                loading ||
                order.state === types.OrderState.Canceled ||
                order.state === types.OrderState.Completed
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
                  setCanceling(true);
                  graphQLClient.setHeader('authorization', accessToken);
                  await graphQLClient.request(CANCEL_ORDER, { id });
                  navigate(0);
                }
              }}
            >
              Cancel Order
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </Page>
  );
};
