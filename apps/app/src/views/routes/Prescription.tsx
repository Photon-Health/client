import { useParams, Link as RouterLink } from 'react-router-dom';
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
  IconButton,
  Stack,
  HStack,
  Link,
  Table,
  TableContainer,
  Tbody,
  Td,
  Tr,
  Text,
  Tooltip,
  VStack,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  useBreakpointValue,
  useColorMode,
  useToast,
  AlertTitle,
  AlertDescription,
  Wrap,
  WrapItem,
  Box,
  LinkBox,
  LinkOverlay
} from '@chakra-ui/react';
import { FiChevronRight, FiCopy } from 'react-icons/fi';
import { gql, GraphQLClient } from 'graphql-request';
import dayjs from 'dayjs';

import { formatDate } from '../../utils';

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
import { Fill, Maybe } from 'packages/sdk/dist/types';
import OrderStatusBadge, { OrderFulfillmentState } from '../components/OrderStatusBadge';

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
  const toast = useToast();
  const params = useParams();
  const id = params.prescriptionId;

  const { getPrescription, getToken } = usePhoton();
  const { prescription, loading, error } = getPrescription({ id: id! });
  const [accessToken, setAccessToken] = useState('');

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
  const tableWidth = useBreakpointValue({ base: 'full', sm: '100%', md: '75%' });
  const { colorMode } = useColorMode();

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

  const buttons =
    loading && !patient ? (
      <Wrap>
        <WrapItem>
          <Skeleton width="111px" height="42px" borderRadius="md" />
        </WrapItem>
        <WrapItem>
          <Skeleton width="156px" height="42px" borderRadius="md" />
        </WrapItem>
      </Wrap>
    ) : (
      <Wrap>
        <WrapItem>
          <Button
            aria-label="Cancel Prescription"
            isDisabled={rx.state !== 'ACTIVE'}
            onClick={async () => {
              const decision = await confirmWrapper('Cancel this prescription?', {
                description: 'You will not be able to undo this action.',
                cancelText: "No, Don't Cancel",
                confirmText: 'Yes, Cancel',
                darkMode: colorMode !== 'light',
                colorScheme: 'red'
              });
              if (decision) {
                graphQLClient.setHeader('authorization', accessToken);
                const res = await graphQLClient.request(CANCEL_PRESCRIPTION, { id });
                if (res) {
                  toast({
                    title: 'Prescription canceled',
                    status: 'success',
                    duration: 5000
                  });
                }
              }
            }}
            variant="outline"
            borderColor="blue.500"
            textColor="blue.500"
            colorScheme="blue"
          >
            Cancel Prescription
          </Button>
        </WrapItem>
        <WrapItem>
          <Button
            aria-label="New Order"
            as={RouterLink}
            to={`/orders/new?patientId=${patient.id}&prescriptionId=${id}`}
            colorScheme="blue"
          >
            Create Order
          </Button>
        </WrapItem>
      </Wrap>
    );

  const orders = useMemo(() => {
    if (!prescription) return [];

    const orderIds = new Set();
    return prescription.fills.filter((fill: any) => {
      if (orderIds.has(fill.order.id)) return false;
      orderIds.add(fill.order.id);
      return true;
    });
  }, [prescription]);

  return (
    <Page header="Prescription" buttons={buttons}>
      <Card>
        <CardHeader>
          <Text fontWeight="medium">
            {loading ? <Skeleton height="30px" width="250px" /> : prescription?.treatment.name}
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
                    <SkeletonText noOfLines={1} flexGrow={1} />
                  </HStack>
                ) : (
                  <PatientView patient={patient} />
                )}
              </VStack>

              <Divider orientation="vertical" height="auto" />

              <VStack align="start" borderRadius={6} w={isMobile ? '50%' : undefined}>
                <Text color="gray.500" fontWeight="medium" fontSize="sm">
                  Prescriber
                </Text>
                {loading ? (
                  <HStack alignContent="center" w="150px" display="flex">
                    <SkeletonCircle size="10" />
                    <SkeletonText noOfLines={1} flexGrow={1} />
                  </HStack>
                ) : (
                  <NameView name={prescriber?.name?.full} />
                )}
              </VStack>
            </Stack>

            <Divider />

            <Text color="gray.500" fontWeight="medium" fontSize="sm">
              Instructions
            </Text>
            <HStack>
              {loading ? (
                <SkeletonText noOfLines={1} width="200px" pt={2} />
              ) : (
                <Text fontSize="md">{instructions}</Text>
              )}
            </HStack>

            <Divider />

            <Text color="gray.500" fontWeight="medium" fontSize="sm">
              Prescription Details
            </Text>

            <TableContainer w={tableWidth}>
              <Table bg="transparent">
                <Tbody>
                  <Tr>
                    <Td ps={0} py={2} border="none">
                      <Text fontSize="md">Status</Text>
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
                        <Tooltip label={stateTip}>
                          <Badge colorScheme={stateColor}>{state}</Badge>
                        </Tooltip>
                      )}
                    </Td>
                  </Tr>
                  <Tr>
                    <Td ps={0} py={2} border="none">
                      <Text fontSize="md">Quantity</Text>
                    </Td>
                    <Td pe={0} py={2} isNumeric={isMobile} border="none">
                      {loading ? (
                        <SkeletonText
                          noOfLines={1}
                          width="100px"
                          ms={isMobile ? 'auto' : undefined}
                        />
                      ) : (
                        <Text fontSize="md">
                          {dispenseQuantity} ct / {daysSupply} day
                        </Text>
                      )}
                    </Td>
                  </Tr>
                  <Tr>
                    <Td ps={0} py={2} border="none">
                      <Text fontSize="md">Fills Remaining</Text>
                    </Td>
                    <Td pe={0} py={2} isNumeric={isMobile} border="none">
                      {loading ? (
                        <SkeletonText
                          noOfLines={1}
                          width="30px"
                          ms={isMobile ? 'auto' : undefined}
                        />
                      ) : (
                        <Text fontSize="md">{fillsRemaining}</Text>
                      )}
                    </Td>
                  </Tr>
                  <Tr>
                    <Td ps={0} py={2} border="none">
                      <Text fontSize="md">Fills Allowed</Text>
                    </Td>
                    <Td pe={0} py={2} isNumeric={isMobile} border="none">
                      {loading ? (
                        <SkeletonText
                          noOfLines={1}
                          width="30px"
                          ms={isMobile ? 'auto' : undefined}
                        />
                      ) : (
                        <Text fontSize="md">{fillsAllowed}</Text>
                      )}
                    </Td>
                  </Tr>
                  <Tr>
                    <Td ps={0} py={2} border="none">
                      <Text fontSize="md">Effective Date</Text>
                    </Td>
                    <Td pe={0} py={2} isNumeric={isMobile} border="none">
                      {loading ? (
                        <SkeletonText
                          noOfLines={1}
                          width="100px"
                          ms={isMobile ? 'auto' : undefined}
                        />
                      ) : (
                        <Text fontSize="md">{effectiveDate}</Text>
                      )}
                    </Td>
                  </Tr>
                  <Tr>
                    <Td ps={0} py={2} border="none">
                      <Text fontSize="md">Expiration</Text>
                    </Td>
                    <Td pe={0} py={2} isNumeric={isMobile} border="none">
                      {loading ? (
                        <SkeletonText
                          noOfLines={1}
                          width="100px"
                          ms={isMobile ? 'auto' : undefined}
                        />
                      ) : (
                        <Text fontSize="md">{expirationDate}</Text>
                      )}
                    </Td>
                  </Tr>
                  <Tr>
                    <Td ps={0} py={2} border="none">
                      <Text fontSize="md">Written</Text>
                    </Td>
                    <Td pe={0} py={2} isNumeric={isMobile} border="none">
                      {loading ? (
                        <SkeletonText
                          noOfLines={1}
                          width="100px"
                          ms={isMobile ? 'auto' : undefined}
                        />
                      ) : (
                        <Text fontSize="md">{writtenAt}</Text>
                      )}
                    </Td>
                  </Tr>
                  <Tr>
                    <Td ps={0} py={2} border="none">
                      <Text fontSize="md">Dispense As Written</Text>
                    </Td>
                    <Td pe={0} py={2} isNumeric={isMobile} border="none">
                      {loading ? (
                        <SkeletonText
                          noOfLines={1}
                          width="50px"
                          ms={isMobile ? 'auto' : undefined}
                        />
                      ) : (
                        <Text fontSize="md">{dispenseAsWritten ? 'Yes' : 'No'}</Text>
                      )}
                    </Td>
                  </Tr>
                  <Tr>
                    <Td px={0} py={2} border="none">
                      <Text fontSize="md">Id</Text>
                    </Td>
                    <Td pe={0} py={2} isNumeric={isMobile} border="none">
                      {loading ? (
                        <SkeletonText
                          noOfLines={1}
                          width="150px"
                          ms={isMobile ? 'auto' : undefined}
                        />
                      ) : (
                        <HStack spacing={2} justifyContent={isMobile ? 'end' : 'start'}>
                          <Text
                            fontSize="md"
                            whiteSpace={isMobile ? 'nowrap' : undefined}
                            overflow={isMobile ? 'hidden' : undefined}
                            textOverflow={isMobile ? 'ellipsis' : undefined}
                            maxWidth={isMobile ? '130px' : undefined}
                          >
                            {id}
                          </Text>
                          <IconButton
                            variant="ghost"
                            color="gray.500"
                            aria-label="Copy external id"
                            minW="fit-content"
                            py={0}
                            _hover={{ backgroundColor: 'transparent' }}
                            icon={<FiCopy size="1.3em" />}
                            onClick={() => navigator.clipboard.writeText(id || '')}
                          />
                        </HStack>
                      )}
                    </Td>
                  </Tr>
                  <Tr>
                    <Td ps={0} py={2} border="none">
                      <Text fontSize="md">External ID</Text>
                    </Td>
                    <Td pe={0} py={2} isNumeric={isMobile} border="none">
                      {loading ? (
                        <SkeletonText
                          noOfLines={1}
                          width="65px"
                          ms={isMobile ? 'auto' : undefined}
                        />
                      ) : rx.externalId ? (
                        <HStack spacing={2} justifyContent={isMobile ? 'end' : 'start'}>
                          <Text
                            fontSize="md"
                            whiteSpace={isMobile ? 'nowrap' : undefined}
                            overflow={isMobile ? 'hidden' : undefined}
                            textOverflow={isMobile ? 'ellipsis' : undefined}
                            maxWidth={isMobile ? '130px' : undefined}
                          >
                            {rx.externalId}
                          </Text>
                          <IconButton
                            variant="ghost"
                            color="gray.500"
                            aria-label="Copy external id"
                            minW="fit-content"
                            py={0}
                            _hover={{ backgroundColor: 'transparent' }}
                            icon={<FiCopy size="1.3em" />}
                            onClick={() => navigator.clipboard.writeText(rx.externalId || '')}
                          />
                        </HStack>
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
              Notes
            </Text>
            <HStack>
              {loading ? (
                <SkeletonText noOfLines={1} width="200px" pt={2} />
              ) : rx.notes ? (
                <Text fontSize="md">{rx.notes}</Text>
              ) : (
                <Text fontSize="md" as="i">
                  None
                </Text>
              )}
            </HStack>

            {orders.length === 0 ? null : (
              <>
                <Divider />

                <Text color="gray.500" fontWeight="medium" fontSize="sm">
                  Orders
                </Text>
                <VStack spacing={4} w="full">
                  {orders.map((fill: Maybe<Fill>) => {
                    if (!fill) return null;
                    const address = fill?.order?.pharmacy?.address;
                    const addressString = address
                      ? `${address?.street1}, ${address?.city}, ${address?.state} ${address?.postalCode}`
                      : '';
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
                                    <Text fontSize="md">
                                      {fill?.order?.pharmacy?.name ||
                                        'Pharmacy not been selected by the patient.'}
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
                                <br />
                                Created At:{' '}
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
          </VStack>
        </CardBody>
      </Card>
    </Page>
  );
};
