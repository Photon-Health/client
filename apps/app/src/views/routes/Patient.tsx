import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';

import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
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
  Table,
  TableContainer,
  Tbody,
  Td,
  Tr,
  Text,
  VStack
} from '@chakra-ui/react';

import { FiEdit, FiChevronRight, FiPlus } from 'react-icons/fi';

import { usePhoton } from '@photonhealth/react';
import { useEffect, useState } from 'react';
import { formatDateLong, formatPhone, formatDate, formatFills } from '../../utils';

import { Page } from '../components/Page';

import { PRESCRIPTION_STATE_MAP, PRESCRIPTION_COLOR_MAP } from './Prescriptions';
import OrderStatusBadge, { OrderFulfillmentState } from '../components/OrderStatusBadge';
import InfoGrid from '../components/InfoGrid';
import CopyText from '../components/CopyText';
import SectionTitleRow from '../components/SectionTitleRow';

export const Patient = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const { patientId: id } = useParams();

  const navigate = useNavigate();

  const { getPatient, getPrescriptions, getOrders } = usePhoton();
  const {
    loading: loadingPatient,
    error,
    patient,
    refetch: refetchPatient
  } = getPatient({ id: id ?? '' });
  const {
    loading: loadingPrescriptions,
    prescriptions,
    refetch: refetchPrescriptions
  } = getPrescriptions({ patientId: id });
  const { loading: loadingOrders, orders, refetch: refetchOrders } = getOrders({ patientId: id });

  useEffect(() => {
    setLoading(loadingPatient || loadingPrescriptions || loadingOrders);
  }, [loadingPatient, loadingPrescriptions, loadingOrders]);

  const sexMap: object = {
    MALE: 'Male',
    FEMALE: 'Female',
    UNKNOWN: 'Unknown'
  };

  useEffect(() => {
    const refetchData = async () => {
      await refetchPatient({ id });
      await refetchPrescriptions({ patientId: id });
      await refetchOrders({ patientId: id });
    };
    refetchData();
  }, [id]);

  if (error || (!loading && !patient)) {
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
          Unknown Patient
        </AlertTitle>
        <AlertDescription maxWidth="sm">
          <div>Looks like we can't find a patient with that ID. </div>
          <Link textDecoration="underline" fontSize="md" href="/patients">
            Go back to patients.
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Page header="Patient">
      <Card>
        <CardHeader>
          <HStack spacing={4} justifyContent="space-between">
            <Text fontWeight="medium">
              {loading ? <Skeleton height="30px" width="250px" /> : patient?.name.full}
            </Text>
            {!loading ? (
              <Button
                size="sm"
                fontSize="sm"
                aria-label="Edit patient details"
                as={RouterLink}
                to={`/patients/update/${id}`}
                leftIcon={<FiEdit />}
                variant="outline"
                borderColor="orange.500"
                textColor="orange.500"
                colorScheme="orange"
              >
                Edit
              </Button>
            ) : undefined}
          </HStack>
        </CardHeader>
        <Divider color="gray.100" />
        <CardBody>
          <VStack spacing={4} align="justify-start">
            {!loading && patient ? (
              <>
                <InfoGrid name="Date of Birth">
                  {loading ? (
                    <SkeletonText skeletonHeight={5} noOfLines={1} width="130px" />
                  ) : (
                    <Text fontSize="md">{formatDateLong(patient.dateOfBirth)}</Text>
                  )}
                </InfoGrid>

                <InfoGrid name="Sex">
                  {loading ? (
                    <SkeletonText skeletonHeight={5} noOfLines={1} width="50px" />
                  ) : (
                    <Text fontSize="md">{sexMap[patient.sex as keyof object]} </Text>
                  )}
                </InfoGrid>

                <InfoGrid name="Gender">
                  {loading ? (
                    <SkeletonText skeletonHeight={5} noOfLines={1} width="50px" />
                  ) : (
                    <Text fontSize="md">{patient.gender}</Text>
                  )}
                </InfoGrid>

                <InfoGrid name="Mobile Number">
                  {' '}
                  {loading ? (
                    <SkeletonText skeletonHeight={5} noOfLines={1} width="120px" />
                  ) : (
                    <Link
                      fontSize="md"
                      href={`tel:${patient.phone}`}
                      isExternal
                      textDecoration="underline"
                    >
                      {formatPhone(patient.phone)}
                    </Link>
                  )}
                </InfoGrid>

                <InfoGrid name="Email">
                  {loading ? (
                    <SkeletonText skeletonHeight={5} noOfLines={1} width="150px" />
                  ) : (
                    <Link
                      fontSize="md"
                      href={`mailto:${patient.email}`}
                      isExternal
                      textDecoration="underline"
                    >
                      {patient.email}
                    </Link>
                  )}
                </InfoGrid>

                <InfoGrid name="Id">
                  {loading ? (
                    <SkeletonText skeletonHeight={5} noOfLines={1} width="150px" />
                  ) : (
                    <CopyText text={id || ''} />
                  )}
                </InfoGrid>
              </>
            ) : null}

            <SectionTitleRow
              headerText="Prescriptions"
              rightElement={
                !loading ? (
                  <Button
                    leftIcon={<FiPlus />}
                    aria-label="New Order"
                    as={RouterLink}
                    to={`/prescriptions/new?patientId=${id}`}
                    colorScheme="blue"
                    size="sm"
                  >
                    Create Prescription
                  </Button>
                ) : undefined
              }
            />

            {prescriptions.length > 0 ? (
              <TableContainer>
                <Table bg="transparent" size="sm">
                  <Tbody>
                    {prescriptions.map(({ id: prescriptionId, treatment, state, writtenAt }, i) =>
                      i < 5 ? (
                        <Tr
                          key={prescriptionId}
                          onClick={() => navigate(`/prescriptions/${prescriptionId}`)}
                          _hover={{ backgroundColor: 'gray.100' }}
                          cursor="pointer"
                        >
                          <Td px={0} py={3} whiteSpace="pre-wrap" borderColor="gray.200">
                            <HStack w="full" justify="space-between">
                              <VStack alignItems="start">
                                <Text>{treatment.name}</Text>
                                <HStack>
                                  <Badge
                                    size="sm"
                                    colorScheme={
                                      PRESCRIPTION_COLOR_MAP[state as keyof object] || ''
                                    }
                                  >
                                    {PRESCRIPTION_STATE_MAP[state as keyof object] || ''}
                                  </Badge>
                                  <Text>{formatDate(writtenAt)}</Text>
                                </HStack>
                              </VStack>
                              <Box alignItems="end">
                                <FiChevronRight size="1.3em" />
                              </Box>
                            </HStack>
                          </Td>
                        </Tr>
                      ) : null
                    )}
                  </Tbody>
                </Table>
              </TableContainer>
            ) : (
              <Text as="i" fontSize="sm" color="gray.500">
                No prescriptions
              </Text>
            )}

            <SectionTitleRow
              headerText="Orders"
              rightElement={
                !loading ? (
                  <Button
                    leftIcon={<FiPlus />}
                    aria-label="New Order"
                    as={RouterLink}
                    to={`/orders/new?patientId=${id}`}
                    colorScheme="blue"
                    size="sm"
                  >
                    Create Order
                  </Button>
                ) : undefined
              }
            />

            {orders.length > 0 ? (
              <TableContainer>
                <Table bg="transparent" size="sm">
                  <Tbody>
                    {orders.map(({ id: orderId, fulfillment, fills, createdAt, state }, i) => {
                      const fillsFormatted = formatFills(fills);

                      return i < 5 ? (
                        <Tr
                          key={orderId}
                          onClick={() => navigate(`/orders/${orderId}`)}
                          _hover={{ backgroundColor: 'gray.100' }}
                          cursor="pointer"
                        >
                          <Td px={0} py={3} whiteSpace="pre-wrap" borderColor="gray.200">
                            <HStack w="full" justify="space-between">
                              <VStack alignItems="start">
                                <Text>{fillsFormatted}</Text>
                                <HStack>
                                  <OrderStatusBadge
                                    fulfillmentState={fulfillment?.state as OrderFulfillmentState}
                                    orderState={state}
                                  />
                                  <Text>{formatDate(createdAt)}</Text>
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
              <Text as="i" fontSize="sm" color="gray.500">
                No Orders
              </Text>
            )}
          </VStack>
        </CardBody>
      </Card>
    </Page>
  );
};

Patient.defaultProps = {
  loading: false,
  error: undefined
};
