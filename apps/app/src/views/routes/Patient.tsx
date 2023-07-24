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
  IconButton,
  Link,
  Skeleton,
  SkeletonText,
  Table,
  TableContainer,
  Tbody,
  Td,
  Tr,
  Text,
  VStack,
  Wrap,
  WrapItem
} from '@chakra-ui/react';

import { FiEdit, FiPhone, FiMail, FiChevronRight, FiPlus } from 'react-icons/fi';

import { usePhoton } from '@photonhealth/react';
import { useEffect, useState } from 'react';
import { formatDateLong, formatPhone, formatDate, formatFills } from '../../utils';

import { Page } from '../components/Page';

import { PRESCRIPTION_STATE_MAP, PRESCRIPTION_COLOR_MAP } from './Prescriptions';
import OrderStatusBadge, { OrderFulfillmentState } from '../components/OrderStatusBadge';
import InfoGrid from '../components/InfoGrid';
import CopyText from '../components/CopyText';

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

  const buttons =
    loading && !patient ? (
      <Wrap>
        <WrapItem>
          <Skeleton width="32px" height="42px" borderRadius={6} />
        </WrapItem>
        <WrapItem>
          <Skeleton width="32px" height="42px" borderRadius={6} />
        </WrapItem>
        <WrapItem>
          <Skeleton width="180px" height="42px" borderRadius={6} />
        </WrapItem>
        <WrapItem>
          <Skeleton width="125px" height="42px" borderRadius={6} />
        </WrapItem>
      </Wrap>
    ) : (
      <Wrap>
        <WrapItem>
          <IconButton
            icon={<FiPhone fontSize="1.2rem" />}
            aria-label="Edit Order"
            as={Link}
            href={`tel:${patient?.phone}`}
            isExternal
            variant="outline"
            borderColor="blue.500"
            textColor="blue.500"
            colorScheme="blue"
          />
        </WrapItem>
        <WrapItem>
          <IconButton
            icon={<FiMail fontSize="1.2rem" />}
            aria-label="Edit Order"
            as={Link}
            href={`mailto:${patient?.email}`}
            isExternal
            variant="outline"
            borderColor="blue.500"
            textColor="blue.500"
            colorScheme="blue"
          />
        </WrapItem>
        <WrapItem>
          <Button
            aria-label="New Prescriptions"
            as={RouterLink}
            to={`/prescriptions/new?patientId=${id}`}
            colorScheme="blue"
          >
            Create Prescriptions
          </Button>
        </WrapItem>
        <WrapItem>
          <Button
            aria-label="New Order"
            as={RouterLink}
            to={`/orders/new?patientId=${id}`}
            variant="outline"
            borderColor="blue.500"
            textColor="blue.500"
            colorScheme="blue"
          >
            Create Order
          </Button>
        </WrapItem>
      </Wrap>
    );

  return (
    <Page header="Patient" buttons={buttons}>
      <Card>
        <CardHeader>
          <Text fontWeight="medium">
            {loading ? <Skeleton height="30px" width="250px" /> : patient?.name.full}
          </Text>
        </CardHeader>
        <Divider color="gray.100" />
        <CardBody>
          <VStack spacing={4} align="justify-start">
            <HStack w="full" justify="space-between">
              <Text color="gray.500" fontWeight="medium" fontSize="sm">
                Information
              </Text>

              <Button
                size="sm"
                fontSize="sm"
                aria-label="Edit patient details"
                as={RouterLink}
                to={`/patients/update/${id}`}
                leftIcon={<FiEdit />}
              >
                Edit
              </Button>
            </HStack>
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

                <InfoGrid name="Cell Phone Number">
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

            <Divider />

            <HStack w="full" justify="space-between">
              <Text color="gray.500" fontWeight="medium" fontSize="sm">
                Prescriptions
              </Text>
              <Button
                size="sm"
                fontSize="sm"
                aria-label="New Prescriptions"
                as={RouterLink}
                to={`/prescriptions/new?patientId=${id}`}
                leftIcon={<FiPlus />}
              >
                New
              </Button>
            </HStack>
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
              <Text as="i">No prescriptions</Text>
            )}

            <HStack w="full" justify="space-between">
              <Text color="gray.500" fontWeight="medium" fontSize="sm">
                Orders
              </Text>
              <Button
                size="sm"
                fontSize="sm"
                aria-label="New Order"
                as={RouterLink}
                to={`/orders/new?patientId=${id}`}
                leftIcon={<FiPlus />}
              >
                New
              </Button>
            </HStack>
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
              <Text as="i">No prescriptions</Text>
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
