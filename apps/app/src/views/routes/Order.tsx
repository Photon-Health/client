import { useParams } from 'react-router-dom';
import { useState, useEffect, useMemo, useRef } from 'react';
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
  SkeletonText,
  Stack,
  Text,
  VStack,
  useColorMode,
  LinkBox,
  LinkOverlay,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Show,
  RadioGroup,
  Radio,
  useTheme
} from '@chakra-ui/react';
import { usePhoton, types } from '@photonhealth/react';
import { FiChevronRight } from 'react-icons/fi';
import { Page } from '../components/Page';
import PatientView from '../components/PatientView';
import { confirmWrapper } from '../components/GuardDialog';
import { formatAddress, formatDate, formatPhone, getMedicationNames } from '../../utils';
import OrderStatusBadge from '../components/OrderStatusBadge';
import InfoGrid from '../components/InfoGrid';
import CopyText from '../components/CopyText';
import { LocalPickup } from './NewOrder/components/SelectPharmacyCard/components/LocalPickup';
import { LocationResults, LocationSearch } from '../components/LocationSearch';
import SectionTitleRow from '../components/SectionTitleRow';
import { gql, useApolloClient, useMutation, useQuery } from '@apollo/client';
import { CANCEL_ORDER, REROUTE_ORDER } from '../../mutations';
import { TicketModal } from '../components/TicketModal';
import { Fill, Order as OrderType } from '@photonhealth/sdk/dist/types';
import { datadogRum } from '@datadog/browser-rum';

const PHARMACY_FRAGMENT = gql`
  fragment PharmacyFragment on Pharmacy {
    id
    name
    phone
    address {
      city
      country
      postalCode
      state
      street1
      street2
    }
  }
`;

const PHARMACY_QUERY = gql`
  ${PHARMACY_FRAGMENT}

  query GetPharmacy($id: ID!) {
    pharmacy(id: $id) {
      ...PharmacyFragment
    }
  }
`;

const GET_ORDER_QUERY_NAME = 'GetOrder';
const GET_ORDER = gql`
  ${PHARMACY_FRAGMENT}

  query ${GET_ORDER_QUERY_NAME}($id: ID!) {
    order(id: $id) {
      __typename
      id
      externalId
      state
      address {
        name {
          full
        }
        city
        country
        postalCode
        state
        street1
        street2
      }
      fills {
        id
        prescription {
          id
          dispenseQuantity
          dispenseUnit
          fillsAllowed
          instructions
        }
        treatment {
          name
        }
        state
        requestedAt
        filledAt
      }
      patient {
        id
        externalId
        name {
          full
        }
        dateOfBirth
        sex
        gender
        email
        phone
      }
      pharmacy {
        ...PharmacyFragment
      }
      fulfillment {
        type
        state
        carrier
        trackingNumber
      }
      exceptions {
        type
        message
        createdAt
        resolvedAt
      }
      createdAt
    }
  }
`;

export const ORDER_FULFILLMENT_TYPE_MAP = {
  [types.FulfillmentType.PickUp]: 'Pick up',
  [types.FulfillmentType.MailOrder]: 'Mail order'
};

const cancelReasons = [
  'Wrong patient selected',
  'Wrong drug selected',
  'Wrong directions written',
  'Wrong pharmacy selected',
  'Therapy change',
  'Patient no longer taking',
  'Changing pharmacies',
  'Other'
];

function uniqueFills(order: OrderType): Fill[] {
  const treatmentNames = new Set();
  return order.fills.filter((fill) =>
    treatmentNames.has(fill.treatment.name) ? false : treatmentNames.add(fill.treatment.name)
  );
}

const rxSummary = (fill: Fill): string => {
  const dispenseQuantity = fill.prescription?.dispenseQuantity || '';
  const dispenseUnit = fill.prescription?.dispenseUnit || '';
  const fillsAllowed = fill.prescription?.fillsAllowed ? fill.prescription.fillsAllowed - 1 : '';
  const instructions = fill.prescription?.instructions || '';
  return `${dispenseQuantity} ${dispenseUnit}, ${fillsAllowed} Refills - ${instructions}`;
};

// ripped from components
function formatRxString({
  dispenseQuantity = 0,
  dispenseUnit = '',
  fillsAllowed = 0,
  instructions = ''
}: {
  dispenseQuantity?: number;
  dispenseUnit?: string;
  fillsAllowed?: number;
  instructions?: string;
}): string {
  const refills = Math.max(fillsAllowed - 1, 0);
  return `${dispenseQuantity} ${dispenseUnit}, ${refills} Refill${
    refills === 1 ? '' : 's'
  } - ${instructions}`;
}

function formatTicketContext({ order, fills }: { order: OrderType; fills: Fill[] }) {
  return `
Order:
  ID: ${order.id}

----
Patient:
  ID: ${order?.patient?.id} 
  Name: ${order?.patient?.name?.full}

----
Prescriptions:
${fills.map(
  (fill) => `
  Name: ${fill.treatment.name}
  Info: ${formatRxString({
    dispenseQuantity: fill?.prescription?.dispenseQuantity,
    dispenseUnit: fill?.prescription?.dispenseUnit,
    fillsAllowed: fill?.prescription?.fillsAllowed,
    instructions: fill?.prescription?.instructions
  })}
`
)}

---- 
Description: 
  `;
}

export const Order = () => {
  const params = useParams();
  const id = params.orderId;
  const { getToken } = usePhoton();
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [updating, setUpdating] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [pharmacyId, setPharmacyId] = useState('');
  const { data, loading, error } = useQuery(GET_ORDER, { variables: { id: id! } });
  const [cancelReason, setCancelReason] = useState('');
  const cancelReasonRef = useRef(cancelReason);
  const client = useApolloClient();
  const theme = useTheme();

  useEffect(() => {
    cancelReasonRef.current = cancelReason;
  }, [cancelReason]);

  const [cancelOrder] = useMutation(CANCEL_ORDER, {
    onQueryUpdated: (observableQuery) => {
      if (observableQuery.queryName !== GET_ORDER_QUERY_NAME) {
        return client?.defaultOptions?.mutate?.onQueryUpdated;
      }
    }
  });
  const [rerouteOrder] = useMutation(REROUTE_ORDER, {
    update: async (cache) => {
      // after routing an order, we need to update the cache with the new pharmacy data optimistically
      const existingOrder: { order: types.Order } | null = cache.readQuery({
        query: GET_ORDER,
        variables: { id: id! }
      });
      try {
        const { data: pharmacyData } = await client.query({
          query: PHARMACY_QUERY,
          variables: { id: pharmacyId }
        });
        if (existingOrder && existingOrder.order && pharmacyData) {
          cache.writeQuery({
            query: GET_ORDER,
            data: {
              order: {
                ...existingOrder.order,
                state: types.OrderState.Placed,
                pharmacy: pharmacyData.pharmacy
              }
            },
            variables: { id: id! }
          });
        }
      } catch (error) {
        console.error('Error fetching pharmacy data:', error);
      }
    }
  });

  const order = data?.order;
  const {
    isOpen: isOpenLocation,
    onOpen: onOpenLocation,
    onClose: onCloseLocation
  } = useDisclosure();
  const [location, setLocation] = useState<LocationResults>({
    lat: undefined,
    lng: undefined,
    loc: ''
  });
  const geocoder = new google.maps.Geocoder();
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

  useEffect(() => {
    // Scroll to top on initial load
    document?.getElementById('root')?.querySelector('section')?.scrollTo(0, 0);
  }, []);

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

  useEffect(() => {
    const address = order?.patient?.address;
    if (!address) return;
    geocoder
      .geocode({ address: formatAddress(address) })
      .then(({ results }) => {
        if (results) {
          setLocation({
            loc: results[0].formatted_address,
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng()
          });
        }
      })
      .catch((err) => {
        console.log('Error geocoding', err);
      });
  }, [order?.patient?.address]);

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

  const fills = order ? uniqueFills(order) : [];
  const medicationNames = getMedicationNames(fills);

  return (
    <>
      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        subject={`Issue with order for ${order?.patient?.name?.full}`}
        body={
          <>
            <Text>Start an email thread with the Photon team to discuss next steps.</Text>
            <Card
              p={4}
              bg={theme.colors.slate['50']}
              borderWidth="1px"
              borderColor={theme.colors.slate['200']}
              borderRadius="lg"
              variant="outline"
            >
              <VStack spacing={4}>
                <Box w="100%">
                  <Text fontSize="xs" color={theme.colors.slate['700']}>
                    PATIENT
                  </Text>
                  <Text fontSize="sm" fontWeight="medium">
                    {order?.patient && order.patient.name.full}
                  </Text>
                </Box>
                <VStack w="100%" align="left">
                  <Text fontSize="xs" color={theme.colors.slate['700']}>
                    PRESCRIPTION
                  </Text>
                  {fills?.length > 0 &&
                    fills.map((fill) => (
                      <Box w="100%" key={fill.treatment.name}>
                        <Text fontSize="sm" fontWeight="medium">
                          {fill?.treatment?.name}
                        </Text>
                        <Text fontSize="sm" color={theme.colors.slate['500']}>
                          {formatRxString({
                            dispenseQuantity: fill?.prescription?.dispenseQuantity,
                            dispenseUnit: fill?.prescription?.dispenseUnit,
                            fillsAllowed: fill?.prescription?.fillsAllowed,
                            instructions: fill?.prescription?.instructions
                          })}
                        </Text>
                      </Box>
                    ))}
                </VStack>
              </VStack>
            </Card>
          </>
        }
        prependContext={!order ? '' : formatTicketContext({ order, fills })}
      />
      <Page
        kicker="ORDER"
        header={
          loading ? (
            <SkeletonText skeletonHeight={5} noOfLines={1} width="300px" mt={2} />
          ) : (
            <CopyText text={id || ''} />
          )
        }
        buttons={
          <Stack
            direction={{ base: 'column-reverse', md: 'row' }}
            w={{ base: 'full', sm: undefined }}
            justify="end"
          >
            <Button
              aria-label="Cancel Order"
              variant="outline"
              borderColor="red.500"
              textColor="red.500"
              colorScheme="red"
              isLoading={updating}
              loadingText="Canceling..."
              isDisabled={
                loading ||
                order.state === types.OrderState.Canceled ||
                order.state === types.OrderState.Completed ||
                order?.fulfillment?.state === 'SHIPPED'
              }
              onClick={async () => {
                datadogRum.addAction('cancel_order_btn_click', {
                  orderId: id
                });

                const decision = await confirmWrapper('Cancel this order?', {
                  description: (
                    <RadioGroup onChange={setCancelReason}>
                      <Text mb={2}>Please select a reason for canceling</Text>
                      <Stack direction="column">
                        {cancelReasons.map((reason) => (
                          <Radio key={reason} value={reason}>
                            {reason}
                          </Radio>
                        ))}
                      </Stack>
                    </RadioGroup>
                  ),
                  cancelText: "No, Don't Cancel",
                  confirmText: 'Yes, Cancel',
                  darkMode: colorMode !== 'light',
                  colorScheme: 'red'
                });
                if (decision) {
                  setUpdating(true);
                  const variables = {
                    id,
                    ...(cancelReasonRef.current && { reason: cancelReasonRef.current })
                  };
                  await cancelOrder({ variables });
                  setUpdating(false);
                }
              }}
            >
              Cancel Order
            </Button>
            <Button
              aria-label="Report Issue"
              colorScheme="blue"
              onClick={() => {
                datadogRum.addAction('report_issue_btn_click', {
                  orderId: id
                });

                setIsTicketModalOpen(true);
              }}
              isDisabled={loading}
            >
              Report Issue
            </Button>
          </Stack>
        }
      >
        <Card>
          <CardHeader>
            <Stack
              direction={{ base: 'column', md: 'row' }}
              justify="space-between"
              align="start"
              width="full"
              spacing={4}
            >
              <VStack w="full" align="start">
                {loading ? (
                  <SkeletonText skeletonHeight={5} noOfLines={1} w="300px" />
                ) : (
                  medicationNames.map((med, i: number) => (
                    <Text key={i} fontWeight="medium" flex="1">
                      {med}
                    </Text>
                  ))
                )}
              </VStack>
              {loading ? (
                <Skeleton width="70px" height="24px" borderRadius="xl" />
              ) : (
                <OrderStatusBadge
                  fulfillmentState={order.fulfillment?.state}
                  orderState={order.state}
                />
              )}
            </Stack>
          </CardHeader>
          <Divider color="gray.100" />
          <CardBody>
            <Stack direction={{ base: 'column', sm: 'row' }} gap={[5, 3]} w="full">
              <VStack align="start" borderRadius={6}>
                <Text color="gray.500" fontWeight="medium" fontSize="sm">
                  Patient
                </Text>
                {loading ? (
                  <HStack alignContent="center" w="150px" display="flex">
                    <SkeletonText skeletonHeight={5} noOfLines={2} flexGrow={1} />
                  </HStack>
                ) : (
                  <PatientView patient={order.patient} />
                )}
              </VStack>

              <Show above="sm">
                <Divider orientation="vertical" height="auto" />
              </Show>

              <VStack align="start" borderRadius={6}>
                <Text color="gray.500" fontWeight="medium" fontSize="sm">
                  Created At
                </Text>

                {loading ? (
                  <SkeletonText skeletonHeight={5} noOfLines={1} width="125px" />
                ) : (
                  <Text fontSize="md">{formatDate(order.createdAt)}</Text>
                )}
              </VStack>
              {order?.externalId ? (
                <>
                  <Show above="sm">
                    <Divider orientation="vertical" height="auto" />
                  </Show>
                  <VStack align="start" borderRadius={6}>
                    <Text color="gray.500" fontWeight="medium" fontSize="sm">
                      External Id
                    </Text>

                    <CopyText text={order?.externalId} size="xs" />
                  </VStack>
                </>
              ) : null}
            </Stack>
          </CardBody>
          <Divider color="gray.100" />
          <CardBody>
            <VStack
              spacing={4}
              fontSize={{ base: 'md', md: 'lg' }}
              alignItems="start"
              w="100%"
              mt={0}
            >
              <SectionTitleRow headerText="Pharmacy Information" />

              {order?.state === types.OrderState.Routing ? (
                <>
                  <Card backgroundColor="gray.50" shadow="none" variant="outline">
                    <CardBody p={3}>
                      <VStack spacing={1} align="start">
                        <VStack spacing={0} align="start">
                          <Text fontSize="md" fontWeight="medium">
                            This order is pending pharmacy selection by the patient.
                          </Text>
                          <Text fontSize="md" color="gray.500">
                            Select a pharmacy for the patient if needed.
                          </Text>
                        </VStack>
                        <Button
                          onClick={() => {
                            datadogRum.addAction('select_pharmacy_btn_click', {
                              orderId: id
                            });

                            onOpen();
                          }}
                          colorScheme="blue"
                          variant="link"
                          mt={2}
                        >
                          Select Pharmacy
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                  <LocationSearch
                    isOpen={isOpenLocation}
                    onClose={({ loc, lat, lng }) => {
                      if (loc && lat && lng) {
                        setLocation({ loc, lat, lng });
                      }
                      onCloseLocation();
                    }}
                  />
                  <Modal isOpen={isOpen} onClose={onClose}>
                    <ModalOverlay />
                    <ModalContent>
                      <ModalHeader>Select a Pharmacy</ModalHeader>
                      <ModalCloseButton />

                      <ModalBody>
                        <LocalPickup
                          location={location.loc}
                          latitude={location.lat}
                          longitude={location.lng}
                          onOpen={onOpenLocation}
                          patient={order.patient}
                          pharmacyId=""
                          updatePreferredPharmacy={false}
                          setUpdatePreferredPharmacy={() => {}}
                          preferredPharmacyIds={[]}
                          setFieldValue={(_, id) => {
                            setPharmacyId(id);
                          }}
                          resetSelection={() => {}}
                        />
                      </ModalBody>

                      <ModalFooter>
                        <Button
                          aria-label="Close Pharmacy Select Modal"
                          variant="solid"
                          size="sm"
                          mr={3}
                          onClick={() => {
                            setPharmacyId('');
                            onClose();
                          }}
                        >
                          Close
                        </Button>
                        <Button
                          aria-label="Set Pharmacy"
                          variant="solid"
                          colorScheme="blue"
                          size="sm"
                          isLoading={updating}
                          loadingText="Setting Pharmacy..."
                          isDisabled={!pharmacyId}
                          onClick={async () => {
                            setUpdating(true);
                            await rerouteOrder({ variables: { id, pharmacyId } });
                            setPharmacyId('');
                            setUpdating(false);
                            onClose();
                          }}
                        >
                          Set Pharmacy
                        </Button>
                      </ModalFooter>
                    </ModalContent>
                  </Modal>
                </>
              ) : null}

              <InfoGrid name="Name">
                {loading ? (
                  <SkeletonText skeletonHeight={5} noOfLines={1} width="100px" />
                ) : order?.pharmacy?.name ? (
                  <Text fontSize="md">{order.pharmacy.name}</Text>
                ) : (
                  <Text fontSize="md" as="i" color="gray.500">
                    None
                  </Text>
                )}
              </InfoGrid>

              <InfoGrid name="Phone">
                {loading ? (
                  <SkeletonText skeletonHeight={5} noOfLines={1} width="100px" />
                ) : order?.pharmacy?.phone ? (
                  <Link fontSize="md" href={`tel:${order.pharmacy.phone}`} isExternal>
                    {formatPhone(order.pharmacy.phone)}
                  </Link>
                ) : (
                  <Text fontSize="md" as="i" color="gray.500">
                    None
                  </Text>
                )}
              </InfoGrid>

              <InfoGrid name="Address">
                {loading ? (
                  <SkeletonText skeletonHeight={5} noOfLines={1} width="100px" />
                ) : order?.pharmacy?.address ? (
                  <Text fontSize="md">{formatAddress(order.pharmacy.address)}</Text>
                ) : (
                  <Text fontSize="md" as="i" color="gray.500">
                    None
                  </Text>
                )}
              </InfoGrid>

              <InfoGrid name="Id">
                {loading ? (
                  <SkeletonText skeletonHeight={5} noOfLines={1} width="100px" />
                ) : order?.pharmacy?.id ? (
                  <CopyText text={order.pharmacy.id} />
                ) : (
                  <Text fontSize="md" as="i" color="gray.500">
                    None
                  </Text>
                )}
              </InfoGrid>

              {!loading && order.fulfillment?.type === 'MAIL_ORDER' ? (
                <>
                  <InfoGrid name="Delivery Address">
                    {order?.address ? (
                      <Text fontSize="md">{formatAddress(order.address)}</Text>
                    ) : (
                      <Text fontSize="md" as="i" color="gray.500">
                        None
                      </Text>
                    )}
                  </InfoGrid>
                  <InfoGrid name="Carrier">
                    {order.fulfillment?.carrier ? (
                      <Text fontSize="md">{order.fulfillment.carrier}</Text>
                    ) : (
                      <Text fontSize="md" as="i" color="gray.500">
                        None
                      </Text>
                    )}
                  </InfoGrid>
                  <InfoGrid name="Tracking Number">
                    {order.fulfillment?.trackingNumber ? (
                      <Text fontSize="md">{order.fulfillment.trackingNumber}</Text>
                    ) : (
                      <Text fontSize="md" as="i" color="gray.500">
                        None
                      </Text>
                    )}
                  </InfoGrid>
                </>
              ) : null}

              <SectionTitleRow headerText="Prescription Fills" />

              {loading ? (
                <SkeletonText skeletonHeight={20} noOfLines={1} width="300px" />
              ) : prescriptions.length === 0 ? (
                <Text as="i" fontSize="sm" color="gray.500">
                  No fills
                </Text>
              ) : (
                <VStack spacing={3}>
                  {prescriptions.map((fill: Fill) => (
                    <LinkBox key={fill.id} style={{ textDecoration: 'none' }} w="full">
                      <Card
                        variant="outline"
                        p={3}
                        shadow="none"
                        backgroundColor="gray.50"
                        _hover={{ backgroundColor: 'gray.100' }}
                      >
                        <HStack justify="space-between">
                          <VStack alignItems="start" spacing={0}>
                            <LinkOverlay href={`/prescriptions/${fill?.prescription?.id}`}>
                              <Text fontSize="md">{fill.treatment.name}</Text>
                            </LinkOverlay>
                            <Text fontSize="md" color="gray.500">
                              {rxSummary(fill)}
                            </Text>
                          </VStack>
                          <Box alignItems="end">
                            <FiChevronRight size="1.3em" />
                          </Box>
                        </HStack>
                      </Card>
                    </LinkBox>
                  ))}
                </VStack>
              )}
            </VStack>
          </CardBody>
        </Card>
      </Page>
    </>
  );
};
