import { useParams } from 'react-router-dom';

import {
  Alert,
  AlertIcon,
  Badge,
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
  useBreakpointValue
} from '@chakra-ui/react';

import { usePhoton, types } from '@photonhealth/react';

import { FiArrowUpRight, FiCheck, FiClock, FiCopy, FiCornerUpRight, FiX } from 'react-icons/fi';
import { Page } from '../components/Page';
import PatientView from '../components/PatientView';

import { formatAddress, formatDate, formatFills, formatPhone } from '../../utils';

import { ORDER_FULFILLMENT_COLOR_MAP, ORDER_FULFILLMENT_STATE_MAP } from './Orders';

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

  const { getOrder } = usePhoton();
  const { order, loading, error } = getOrder({ id: id! });

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error.message}
      </Alert>
    );
  }

  const isMobile = useBreakpointValue({ base: true, sm: false });
  const tableWidth = useBreakpointValue({ base: 'full', sm: '100%', md: '75%' });

  console.log(order.state);

  return (
    <Page kicker="Order" header={order ? formatFills(order.fills) : ''} loading={loading}>
      <VStack spacing={4} fontSize={{ base: 'md', md: 'lg' }} alignItems="start" w="100%" mt={0}>
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

        <TableContainer w={tableWidth}>
          <Table bg="transparent">
            <Tbody>
              <Tr>
                <Td px={0} py={2} border="none">
                  <Text fontSize="md">Order Status</Text>
                </Td>
                <Td pe={0} py={2} isNumeric={isMobile} border="none">
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
                <Td pe={0} py={2} isNumeric={isMobile} border="none">
                  {loading ? (
                    <SkeletonText noOfLines={1} width="150px" ms={isMobile ? 'auto' : undefined} />
                  ) : order.id ? (
                    <HStack spacing={2} justifyContent={isMobile ? 'end' : 'start'}>
                      <Text
                        fontSize="md"
                        whiteSpace={isMobile ? 'nowrap' : undefined}
                        overflow={isMobile ? 'hidden' : undefined}
                        textOverflow={isMobile ? 'ellipsis' : undefined}
                        maxWidth={isMobile ? '130px' : undefined}
                      >
                        {order.id}
                      </Text>
                      <IconButton
                        variant="ghost"
                        color="gray.500"
                        minW="fit-content"
                        py={0}
                        aria-label="Copy id"
                        _hover={{ backgroundColor: 'transparent' }}
                        icon={<FiCopy size="1.3em" />}
                        onClick={() => navigator.clipboard.writeText(order.id)}
                      />
                    </HStack>
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
                <Td pe={0} py={2} isNumeric={isMobile} border="none">
                  {loading ? (
                    <SkeletonText noOfLines={1} width="150px" ms={isMobile ? 'auto' : undefined} />
                  ) : order.externalId ? (
                    <HStack spacing={2} justifyContent={isMobile ? 'end' : 'start'}>
                      <Text
                        fontSize="md"
                        whiteSpace={isMobile ? 'nowrap' : undefined}
                        overflow={isMobile ? 'hidden' : undefined}
                        textOverflow={isMobile ? 'ellipsis' : undefined}
                        maxWidth={isMobile ? '130px' : undefined}
                      >
                        {order.externalId}
                      </Text>
                      <IconButton
                        variant="ghost"
                        color="gray.500"
                        aria-label="Copy external id"
                        minW="fit-content"
                        py={0}
                        _hover={{ backgroundColor: 'transparent' }}
                        icon={<FiCopy size="1.3em" />}
                        onClick={() => navigator.clipboard.writeText(order.externalId || '')}
                      />
                    </HStack>
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
                <Td pe={0} py={2} isNumeric={isMobile} border="none">
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

        <TableContainer w={tableWidth}>
          <Table bg="transparent">
            <Tbody>
              <Tr>
                <Td px={0} py={2} border="none">
                  <Text fontSize="md">Type</Text>
                </Td>
                <Td pe={0} py={2} isNumeric={isMobile} border="none">
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
                <Td pe={0} py={2} isNumeric={isMobile} border="none">
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
                    <Td pe={0} py={2} isNumeric={isMobile} border="none">
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
                    <Td pe={0} py={2} isNumeric={isMobile} border="none">
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
                  <Text fontSize="md">Pharmacy Name</Text>
                </Td>
                <Td pe={0} py={2} isNumeric={isMobile} border="none">
                  {loading ? (
                    <SkeletonText noOfLines={1} width="100px" ms={isMobile ? 'auto' : undefined} />
                  ) : order?.pharmacy?.name ? (
                    <Text fontSize="md">
                      {order.pharmacy.name} {order.pharmacy.id}
                    </Text>
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
                <Td pe={0} py={2} isNumeric={isMobile} border="none" whiteSpace="normal">
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
                <Td pe={0} py={2} isNumeric={isMobile} border="none">
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
