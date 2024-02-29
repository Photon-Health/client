import { useParams, Link as RouterLink } from 'react-router-dom';

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
  LinkBox,
  LinkOverlay,
  SkeletonText,
  Stack,
  Text,
  VStack
} from '@chakra-ui/react';

import { FiEdit, FiChevronRight, FiPlus } from 'react-icons/fi';

import { usePhoton } from '@photonhealth/react';
import { useEffect, useState } from 'react';
import { formatDateLong, formatPhone, formatDate, getMedicationNames } from '../../utils';

import { Page } from '../components/Page';

import { PRESCRIPTION_STATE_MAP, PRESCRIPTION_COLOR_MAP } from './Prescriptions';
import OrderStatusBadge, { OrderFulfillmentState } from '../components/OrderStatusBadge';
import InfoGrid from '../components/InfoGrid';
import CopyText from '../components/CopyText';
import SectionTitleRow from '../components/SectionTitleRow';

export const Patient = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const { patientId: id } = useParams();

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

  useEffect(() => {
    // Scroll to top on initial load
    document?.getElementById('root')?.querySelector('section')?.scrollTo(0, 0);
  }, []);

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
    <Page
      kicker="PATIENT"
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
            aria-label="Edit patient details"
            as={RouterLink}
            to={`/patients/update/${id}`}
            leftIcon={<FiEdit />}
            variant="outline"
            borderColor="orange.500"
            textColor="orange.500"
            colorScheme="orange"
          >
            Edit Patient
          </Button>
          <Button
            leftIcon={<FiPlus />}
            aria-label="New Order"
            as={RouterLink}
            to={`/prescriptions/new?patientId=${id}`}
            colorScheme="blue"
          >
            Create Prescription
          </Button>
        </Stack>
      }
    >
      <Card>
        <CardHeader>
          <Text fontWeight="medium" data-dd-privacy="mask">
            {loading ? (
              <SkeletonText skeletonHeight={5} noOfLines={1} width="200px" />
            ) : (
              <Text fontWeight="medium" flex="1">
                {patient?.name.full}
              </Text>
            )}
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
            {!loading && patient ? (
              <>
                <InfoGrid name="Date of Birth">
                  {loading ? (
                    <SkeletonText skeletonHeight={5} noOfLines={1} width="130px" />
                  ) : (
                    <Text fontSize="md" data-dd-privacy="mask">
                      {formatDateLong(patient.dateOfBirth)}
                    </Text>
                  )}
                </InfoGrid>

                <InfoGrid name="Sex">
                  {loading ? (
                    <SkeletonText skeletonHeight={5} noOfLines={1} width="50px" />
                  ) : (
                    <Text fontSize="md" data-dd-privacy="mask">
                      {sexMap[patient.sex as keyof object]}{' '}
                    </Text>
                  )}
                </InfoGrid>

                <InfoGrid name="Gender">
                  {loading ? (
                    <SkeletonText skeletonHeight={5} noOfLines={1} width="50px" />
                  ) : (
                    <Text fontSize="md" data-dd-privacy="mask">
                      {patient.gender}
                    </Text>
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
                      data-dd-privacy="mask"
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
                      data-dd-privacy="mask"
                    >
                      {patient.email}
                    </Link>
                  )}
                </InfoGrid>
              </>
            ) : null}
          </VStack>
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
            <SectionTitleRow headerText="Prescriptions" />

            {loading ? (
              <SkeletonText skeletonHeight={20} noOfLines={1} width="300px" />
            ) : prescriptions.length === 0 ? (
              <Text as="i" fontSize="sm" color="gray.500">
                No prescriptions
              </Text>
            ) : (
              <VStack spacing={3} align="start">
                {prescriptions.map(({ id: prescriptionId, treatment, state, writtenAt }, i) =>
                  i < 5 ? (
                    <LinkBox key={prescriptionId} style={{ textDecoration: 'none' }} w="full">
                      <Card
                        variant="outline"
                        p={3}
                        shadow="none"
                        backgroundColor="gray.50"
                        _hover={{ backgroundColor: 'gray.100' }}
                      >
                        <HStack w="full" justify="space-between">
                          <VStack alignItems="start">
                            <LinkOverlay href={`/prescriptions/${prescriptionId}`}>
                              <Text fontSize="md">{treatment.name}</Text>
                            </LinkOverlay>
                            <HStack>
                              <Badge
                                size="sm"
                                colorScheme={PRESCRIPTION_COLOR_MAP[state as keyof object] || ''}
                              >
                                {PRESCRIPTION_STATE_MAP[state as keyof object] || ''}
                              </Badge>
                              <Text fontSize="md" color="gray.500">
                                {formatDate(writtenAt)}
                              </Text>
                            </HStack>
                          </VStack>
                          <Box alignItems="end">
                            <FiChevronRight size="1.3em" />
                          </Box>
                        </HStack>
                      </Card>
                    </LinkBox>
                  ) : null
                )}
              </VStack>
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

            {loading ? (
              <SkeletonText skeletonHeight={20} noOfLines={1} width="300px" />
            ) : orders.length === 0 ? (
              <Text as="i" fontSize="sm" color="gray.500">
                No Orders
              </Text>
            ) : (
              <VStack spacing={3} align="start">
                {orders.map(({ id: orderId, fulfillment, fills, createdAt, state }, i) => {
                  const medNames = getMedicationNames(fills).join(', ');

                  return i < 5 ? (
                    <LinkBox key={orderId} style={{ textDecoration: 'none' }} w="full">
                      <Card
                        variant="outline"
                        p={3}
                        shadow="none"
                        backgroundColor="gray.50"
                        _hover={{ backgroundColor: 'gray.100' }}
                      >
                        <HStack w="full" justify="space-between">
                          <VStack alignItems="start">
                            <LinkOverlay href={`/orders/${orderId}`}>
                              <Text fontSize="md">{medNames}</Text>
                            </LinkOverlay>
                            <HStack>
                              <OrderStatusBadge
                                fulfillmentState={fulfillment?.state as OrderFulfillmentState}
                                orderState={state}
                              />
                              <Text fontSize="md" color="gray.500">
                                {formatDate(createdAt)}
                              </Text>
                            </HStack>
                          </VStack>
                          <Box alignItems="end">
                            <FiChevronRight size="1.3em" />
                          </Box>
                        </HStack>
                      </Card>
                    </LinkBox>
                  ) : null;
                })}
              </VStack>
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
