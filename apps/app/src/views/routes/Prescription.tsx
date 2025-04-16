import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { usePhoton } from '@photonhealth/react';
import {
  Alert,
  AlertIcon,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Stack,
  HStack,
  Link,
  Tag,
  Text,
  Tooltip,
  VStack,
  Skeleton,
  SkeletonText,
  useColorMode,
  AlertTitle,
  AlertDescription,
  Box,
  LinkBox,
  LinkOverlay,
  Show
} from '@chakra-ui/react';
import { FiChevronRight, FiPlus, FiRepeat } from 'react-icons/fi';
import { GraphQLClient } from 'graphql-request';
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
import SectionTitleRow from '../components/SectionTitleRow';
import usePermissions from '../../hooks/usePermissions';
import { CANCEL_PRESCRIPTION } from '../../mutations';

import { datadogRum } from '@datadog/browser-rum';
import { Fill, Maybe } from 'packages/sdk/dist/types';

export const graphQLClient = new GraphQLClient(process.env.REACT_APP_GRAPHQL_URI as string, {
  jsonSerializer: {
    parse: JSON.parse,
    stringify: JSON.stringify
  }
});

export const Prescription = () => {
  const params = useParams();
  const id = params.prescriptionId;
  const hasPermission = usePermissions(['write:prescription']);

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

  useEffect(() => {
    // Scroll to top on initial load
    document?.getElementById('root')?.querySelector('section')?.scrollTo(0, 0);
  }, []);

  const {
    prescriber,
    patient,
    dispenseAsWritten,
    dispenseQuantity,
    dispenseUnit,
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

  const canDuplicate = !loading && rx.state !== types.PrescriptionState.Canceled && hasPermission;
  const canCreateOrder = rx.state === types.PrescriptionState.Active;

  return (
    <Page
      kicker="PRESCRIPTION"
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
            aria-label="Cancel Prescription"
            isDisabled={loading || rx.state !== 'ACTIVE'}
            isLoading={canceling}
            loadingText="Canceling..."
            onClick={async () => {
              datadogRum.addAction('cancel_prescription_btn_click', {
                prescriptionId: id
              });

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
          >
            Cancel Prescription
          </Button>
          <Button
            leftIcon={<FiPlus />}
            aria-label="New Order"
            onClick={() => {
              datadogRum.addAction('new_order_btn_click', {
                prescriptionId: id
              });

              if (canCreateOrder) {
                navigate(
                  `/orders/new?prescriptionId=${id}${
                    patient?.id ? `&patientId=${patient?.id}` : ''
                  }`
                );
              }
            }}
            isDisabled={!canCreateOrder}
            colorScheme="blue"
            role="link"
          >
            Create Order
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
                <SkeletonText skeletonHeight={5} noOfLines={1} w="250px" />
              ) : (
                <Text fontWeight="medium" flex="1">
                  {prescription?.treatment?.name}
                </Text>
              )}
            </VStack>
            {loading ? (
              <Skeleton width="70px" height="24px" borderRadius="xl" />
            ) : (
              <Tooltip label={stateTip}>
                <Tag size="sm" borderRadius="full" colorScheme={stateColor} flexShrink={0}>
                  {state}
                </Tag>
              </Tooltip>
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
                  <SkeletonText skeletonHeight={5} noOfLines={1} flexGrow={1} />
                </HStack>
              ) : (
                <PatientView patient={patient} />
              )}
            </VStack>

            <Show above="sm">
              <Divider orientation="vertical" height="auto" />
            </Show>

            <VStack align="start" borderRadius={6}>
              <Text color="gray.500" fontWeight="medium" fontSize="sm">
                Written
              </Text>
              <Stack alignItems="center" justifyContent="center" height="100%">
                {loading ? (
                  <SkeletonText skeletonHeight={5} noOfLines={1} width="100px" />
                ) : (
                  <Text fontSize="md">{writtenAt}</Text>
                )}
              </Stack>
            </VStack>

            <Show above="sm">
              <Divider orientation="vertical" height="auto" />
            </Show>

            <VStack align="start" borderRadius={6}>
              <Text color="gray.500" fontWeight="medium" fontSize="sm">
                Prescriber
              </Text>
              {loading ? (
                <HStack alignContent="center" w="150px" display="flex">
                  <SkeletonText skeletonHeight={5} noOfLines={1} flexGrow={1} />
                </HStack>
              ) : (
                <NameView name={prescriber?.name?.full} />
              )}
            </VStack>
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
            <SectionTitleRow
              headerText="Prescription"
              rightElement={
                <Button
                  leftIcon={<FiRepeat />}
                  aria-label="Duplicate Prescription"
                  onClick={() => {
                    datadogRum.addAction('renew_btn_click', {
                      prescriptionId: id
                    });

                    if (canDuplicate) {
                      navigate(
                        `/prescriptions/new?prescriptionIds=${id}${
                          patient?.id ? `&patientId=${patient?.id}` : ''
                        }`
                      );
                    }
                  }}
                  isDisabled={!canDuplicate}
                  colorScheme="blue"
                  size="sm"
                  role="link"
                  variant="outline"
                >
                  Renew
                </Button>
              }
            />

            <InfoGrid name="Instructions">
              {loading ? (
                <SkeletonText skeletonHeight={5} noOfLines={1} width="100px" />
              ) : (
                <Text fontSize="md">{instructions}</Text>
              )}
            </InfoGrid>

            <InfoGrid name="Pharmacy Notes">
              {loading ? (
                <SkeletonText skeletonHeight={5} noOfLines={1} width="100px" />
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

            <InfoGrid name="Quantity">
              {loading ? (
                <SkeletonText skeletonHeight={5} noOfLines={1} width="100px" />
              ) : (
                <Text fontSize="md">
                  {dispenseQuantity} {dispenseUnit} / {daysSupply} day
                </Text>
              )}
            </InfoGrid>

            <InfoGrid name="Fills Remaining">
              {loading ? (
                <SkeletonText skeletonHeight={5} noOfLines={1} width="100px" />
              ) : (
                <Text fontSize="md">{fillsRemaining}</Text>
              )}
            </InfoGrid>

            <InfoGrid name="Fills Allowed">
              {loading ? (
                <SkeletonText skeletonHeight={5} noOfLines={1} width="100px" />
              ) : (
                <Text fontSize="md">{fillsAllowed}</Text>
              )}
            </InfoGrid>

            <InfoGrid name="Do Not Fill Before">
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

            <InfoGrid name="Dispense As Written">
              {loading ? (
                <SkeletonText skeletonHeight={5} noOfLines={1} width="100px" />
              ) : (
                <Text fontSize="md">{dispenseAsWritten ? 'Yes' : 'No'}</Text>
              )}
            </InfoGrid>

            <InfoGrid name="External Id">
              {loading ? (
                <SkeletonText skeletonHeight={5} noOfLines={1} width="100px" />
              ) : rx.externalId ? (
                <CopyText text={rx.externalId || ''} />
              ) : (
                <Text fontSize="md" as="i" color="gray.500">
                  None
                </Text>
              )}
            </InfoGrid>

            <SectionTitleRow
              headerText="Pharmacy Orders"
              subHeaderText="Below are orders that include fills from this prescription."
            />

            {loading ? (
              <SkeletonText skeletonHeight={20} noOfLines={1} width="300px" />
            ) : orders.length === 0 ? (
              <Text>No orders for this prescription</Text>
            ) : (
              <VStack spacing={3}>
                {orders.map((fill: Maybe<Fill>) => {
                  if (!fill) return null;
                  const address = fill?.order?.pharmacy?.address;
                  const addressString = formatAddress(address as FormatAddressProps);
                  return (
                    <LinkBox key={fill.id} w="full" style={{ textDecoration: 'none' }}>
                      <Card
                        variant="outline"
                        p={3}
                        w="full"
                        shadow="none"
                        backgroundColor="gray.50"
                        _hover={{ backgroundColor: 'gray.100' }}
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
                              Created: {dayjs(fill?.order?.createdAt).format('MMM D, YYYY, h:mm A')}
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
            )}
          </VStack>
        </CardBody>
      </Card>
    </Page>
  );
};
