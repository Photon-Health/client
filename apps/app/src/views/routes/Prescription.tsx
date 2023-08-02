import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { usePhoton } from '@photonhealth/react';
import {
  Alert,
  AlertIcon,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Stack,
  HStack,
  Link,
  Text,
  Tooltip,
  VStack,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  useBreakpointValue,
  useColorMode,
  AlertTitle,
  AlertDescription,
  Box,
  LinkBox,
  LinkOverlay,
  Show
} from '@chakra-ui/react';
import { FiChevronRight, FiPlus, FiRepeat } from 'react-icons/fi';
import { gql, GraphQLClient } from 'graphql-request';
import dayjs from 'dayjs';

import { formatAddress, FormatAddressProps, formatDate } from '../../utils';

import {
  PRESCRIPTION_COLOR_MAP,
  PRESCRIPTION_STATE_MAP,
  PRESCRIPTION_TIP_MAP,
  PrescriptionStateRecord
} from './Prescriptions';

import { Page } from '../components/Page';
import { confirmWrapper } from '../components/GuardDialog';
import PatientView from '../components/PatientView';
import NameView from '../components/NameView';
import { types } from '@photonhealth/sdk';
import OrderStatusBadge, { OrderFulfillmentState } from '../components/OrderStatusBadge';
import InfoGrid from '../components/InfoGrid';
import CopyText from '../components/CopyText';

export const graphQLClient = new GraphQLClient(process.env.REACT_APP_GRAPHQL_URI as string, {
  jsonSerializer: {
    parse: JSON.parse,
    stringify: JSON.stringify
  }
});

export const CANCEL_PRESCRIPTION = gql`
  mutation cancel($id: ID!) {
    cancelPrescription(id: $id) {
      id
    }
  }
`;

export const Prescription = () => {
  const params = useParams();
  const id = params.prescriptionId;

  const { getPrescription, getToken } = usePhoton();
  const navigate = useNavigate();
  const { prescription, loading, error } = getPrescription({ id: id! });
  const [accessToken, setAccessToken] = useState('');
  const [canceling, setCanceling] = useState(false);
  const rx = prescription || {};

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

  const {
    prescriber,
    patient,
    dispenseAsWritten,
    dispenseQuantity,
    fillsAllowed,
    fillsRemaining,
    daysSupply,
    instructions
  } = rx;

  const state = PRESCRIPTION_STATE_MAP[rx.state as keyof PrescriptionStateRecord] || '';
  const stateColor = PRESCRIPTION_COLOR_MAP[rx.state as keyof PrescriptionStateRecord] || '';
  const stateTip = PRESCRIPTION_TIP_MAP[rx.state as keyof PrescriptionStateRecord] || '';

  const writtenAt = formatDate(rx.writtenAt);
  const effectiveDate = formatDate(rx.effectiveDate);
  const expirationDate = formatDate(rx.expirationDate);

  const isMobile = useBreakpointValue({ base: true, sm: false });
  const { colorMode } = useColorMode();

  const orders = useMemo(() => {
    if (!prescription) return [];
    const orderIds = new Set();
    return prescription.fills.filter((fill: any) => {
      if (orderIds.has(fill.order.id)) return false;
      orderIds.add(fill.order.id);
      return true;
    });
  }, [prescription]);

  if (error || (!loading && !prescription)) {
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
          Unknown Prescription
        </AlertTitle>
        <AlertDescription maxWidth="sm">
          <div>Looks like we can't find a prescription with that ID.</div>
          <Link textDecoration="underline" fontSize="md" href="/prescriptions">
            Go back to prescriptions.
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Page header="Prescription">
      <Card>
        <CardHeader>
          <Text fontWeight="medium">
            {loading ? <Skeleton height="30px" width="250px" /> : prescription?.treatment?.name}
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
            <Stack direction={{ base: 'column', sm: 'row' }} gap={3} w="full">
              <VStack align="start" borderRadius={6} w={isMobile ? '50%' : undefined}>
                <Text color="gray.500" fontWeight="medium" fontSize="sm">
                  Patient
                </Text>
                {loading ? (
                  <HStack alignContent="center" w="150px" display="flex">
                    <SkeletonCircle size="10" />
                    <SkeletonText skeletonHeight={5} noOfLines={1} flexGrow={1} />
                  </HStack>
                ) : (
                  <PatientView patient={patient} />
                )}
              </VStack>
              <Show above="sm">
                <Divider orientation="vertical" height="auto" />
              </Show>

              <VStack align="start" borderRadius={6} w={isMobile ? '50%' : undefined}>
                <Text color="gray.500" fontWeight="medium" fontSize="sm">
                  Prescriber
                </Text>
                {loading ? (
                  <HStack alignContent="center" w="150px" display="flex">
                    <SkeletonCircle size="10" />
                    <SkeletonText skeletonHeight={5} noOfLines={1} flexGrow={1} />
                  </HStack>
                ) : (
                  <NameView name={prescriber?.name?.full} />
                )}
              </VStack>
            </Stack>

            <Divider />
            <HStack justifyContent="space-between" width="100%">
              <Text color="gray.500" fontWeight="medium" fontSize="sm">
                Prescription Details
              </Text>
              <Button
                leftIcon={<FiRepeat />}
                aria-label="Duplicate Prescription"
                onClick={() => {
                  if (!(loading || rx.state === types.PrescriptionState.Active)) {
                    navigate(
                      `/prescriptions/new?prescriptionIds=${id}${
                        patient?.id ? `&patientId=${patient?.id}` : ''
                      }`
                    );
                  }
                }}
                isDisabled={loading || rx.state === types.PrescriptionState.Active}
                colorScheme="blue"
                size="sm"
                role="link"
              >
                Duplicate Prescription
              </Button>
            </HStack>
            <InfoGrid name="Instructions">
              {loading ? (
                <SkeletonText skeletonHeight={5} noOfLines={1} width="150px" />
              ) : (
                <Text fontSize="md">{instructions}</Text>
              )}
            </InfoGrid>

            <InfoGrid name="Pharmacy Notes">
              {loading ? (
                <SkeletonText skeletonHeight={5} noOfLines={1} width="150px" />
              ) : (
                <Text
                  fontSize="md"
                  as={!rx?.notes ? 'i' : undefined}
                  color={!rx?.notes ? 'gray.500' : undefined}
                >
                  {rx?.notes ? rx.notes : 'None'}
                </Text>
              )}
            </InfoGrid>

            <InfoGrid name="Status">
              {loading ? (
                <SkeletonText skeletonHeight={5} noOfLines={1} width="100px" />
              ) : (
                <Tooltip label={stateTip}>
                  <Badge colorScheme={stateColor}>{state}</Badge>
                </Tooltip>
              )}
            </InfoGrid>

            <InfoGrid name="Quantity">
              {loading ? (
                <SkeletonText skeletonHeight={5} noOfLines={1} width="100px" />
              ) : (
                <Text fontSize="md">
                  {dispenseQuantity} ct / {daysSupply} day
                </Text>
              )}
            </InfoGrid>

            <InfoGrid name="Fills Remaining">
              {loading ? (
                <SkeletonText skeletonHeight={5} noOfLines={1} width="20px" />
              ) : (
                <Text fontSize="md">{fillsRemaining}</Text>
              )}
            </InfoGrid>

            <InfoGrid name="Fills Allowed">
              {loading ? (
                <SkeletonText skeletonHeight={5} noOfLines={1} width="20px" />
              ) : (
                <Text fontSize="md">{fillsAllowed}</Text>
              )}
            </InfoGrid>

            <InfoGrid name="Effective Date">
              {loading ? (
                <SkeletonText skeletonHeight={5} noOfLines={1} width="100px" />
              ) : (
                <Text fontSize="md">{effectiveDate}</Text>
              )}
            </InfoGrid>

            <InfoGrid name="Expiration">
              {loading ? (
                <SkeletonText skeletonHeight={5} noOfLines={1} width="100px" />
              ) : (
                <Text fontSize="md">{expirationDate}</Text>
              )}
            </InfoGrid>

            <InfoGrid name="Written">
              {loading ? (
                <SkeletonText skeletonHeight={5} noOfLines={1} width="100px" />
              ) : (
                <Text fontSize="md">{writtenAt}</Text>
              )}
            </InfoGrid>

            <InfoGrid name="Dispense As Written">
              {loading ? (
                <SkeletonText skeletonHeight={5} noOfLines={1} width="50px" />
              ) : (
                <Text fontSize="md">{dispenseAsWritten ? 'Yes' : 'No'}</Text>
              )}
            </InfoGrid>
            <Divider />
            <HStack justifyContent="space-between" width="100%">
              <Text color="gray.500" fontWeight="medium" fontSize="sm">
                Orders
              </Text>
              {loading ? null : (
                <Button
                  leftIcon={<FiPlus />}
                  aria-label="New Order"
                  onClick={() => {
                    if (rx.state !== types.PrescriptionState.Depleted) {
                      navigate(
                        `/orders/new?prescriptionId=${id}${
                          patient?.id ? `&patientId=${patient?.id}` : ''
                        }`
                      );
                    }
                  }}
                  isDisabled={rx.state === types.PrescriptionState.Depleted}
                  colorScheme="blue"
                  size="sm"
                  role="link"
                >
                  Create Order
                </Button>
              )}
            </HStack>
            {loading ? (
              <SkeletonText skeletonHeight={5} noOfLines={1} width="100%" />
            ) : (
              <>
                {orders.length === 0 ? (
                  <Text>No orders for this prescription</Text>
                ) : (
                  <>
                    <VStack spacing={4} w="full">
                      {orders.map((fill: types.Maybe<types.Fill>) => {
                        if (!fill) return null;
                        const address = fill?.order?.pharmacy?.address;
                        const addressString = formatAddress(address as FormatAddressProps);
                        return (
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
                                    <LinkOverlay href={`/orders/${fill?.order?.id}`}>
                                      <HStack spacing={2}>
                                        <Text
                                          fontSize="md"
                                          as={fill?.order?.pharmacy?.name ? undefined : 'i'}
                                        >
                                          {fill?.order?.pharmacy?.name || 'Pending Selection'}
                                        </Text>
                                        <OrderStatusBadge
                                          fulfillmentState={
                                            fill?.order?.fulfillment?.state as OrderFulfillmentState
                                          }
                                          orderState={fill?.order?.state}
                                        />
                                      </HStack>
                                    </LinkOverlay>
                                  </HStack>
                                  <Text fontSize="sm" color="gray.500">
                                    {addressString}
                                    {addressString ? <br /> : null}
                                    Created:{' '}
                                    {dayjs(fill?.order?.createdAt).format('MMM D, YYYY, h:mm A')}
                                  </Text>
                                </VStack>
                                <Box alignItems="end">
                                  <FiChevronRight size="1.3em" />
                                </Box>
                              </HStack>
                            </Card>
                          </LinkBox>
                        );
                      })}
                    </VStack>
                  </>
                )}
              </>
            )}
            <Divider />
            <Text color="gray.500" fontWeight="medium" fontSize="sm">
              Advanced
            </Text>

            <InfoGrid name="Id">
              {loading ? (
                <SkeletonText skeletonHeight={5} noOfLines={1} width="150px" />
              ) : (
                <CopyText text={id || ''} />
              )}
            </InfoGrid>

            <InfoGrid name="External Id">
              {loading ? (
                <SkeletonText skeletonHeight={5} noOfLines={1} width="65px" />
              ) : rx.externalId ? (
                <CopyText text={rx.externalId || ''} />
              ) : (
                <Text fontSize="md" as="i">
                  None
                </Text>
              )}
            </InfoGrid>

            <Divider />

            <Text color="gray.500" fontWeight="medium" fontSize="sm">
              Actions
            </Text>
            <Text>
              Canceling a prescription will prevent any team member from adding the prescription
              fills in a new order.
            </Text>
            {rx?.state && rx.state !== 'ACTIVE' && (
              <Alert colorScheme="gray">
                <AlertIcon />
                This prescription has been {rx?.state?.toLowerCase()}
              </Alert>
            )}
            <Button
              aria-label="Cancel Prescription"
              isDisabled={loading || rx.state !== 'ACTIVE'}
              isLoading={canceling}
              loadingText="Canceling..."
              onClick={async () => {
                const decision = await confirmWrapper('Cancel this prescription?', {
                  description: 'You will not be able to undo this action.',
                  cancelText: "No, Don't Cancel",
                  confirmText: 'Yes, Cancel',
                  darkMode: colorMode !== 'light',
                  colorScheme: 'red'
                });
                if (decision) {
                  setCanceling(true);
                  graphQLClient.setHeader('authorization', accessToken);
                  await graphQLClient.request(CANCEL_PRESCRIPTION, { id });
                  navigate(0);
                }
              }}
              variant="outline"
              textColor="red.500"
              colorScheme="red"
              size="sm"
            >
              Cancel Prescription
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </Page>
  );
};
