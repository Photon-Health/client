import { Link as RouterLink, useParams } from 'react-router-dom';
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
  LinkBox,
  LinkOverlay,
  SkeletonText,
  Stack,
  Text,
  VStack
} from '@chakra-ui/react';
import { FiChevronRight, FiEdit, FiPlus } from 'react-icons/fi';
import { usePhoton } from '@photonhealth/react';
import { useEffect, useMemo, useState } from 'react';
import { formatDate, formatDateLongUTC, formatPhone, getMedicationNames } from '../../../utils';
import { Page } from '../../components/Page';
import { PatientPrescriptions } from './components/PatientPrescriptions';
import OrderStatusBadge, { OrderFulfillmentState } from '../../components/OrderStatusBadge';
import InfoGrid from '../../components/InfoGrid';
import CopyText from '../../components/CopyText';
import SectionTitleRow from '../../components/SectionTitleRow';

export const Patient = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const { patientId: rawId } = useParams<{ patientId: string }>();

  const { getPatient, getPrescriptions, getOrders } = usePhoton();
  const {
    loading: loadingPatient,
    error,
    patient,
    refetch: refetchPatient
  } = getPatient({ id: rawId ?? '' });
  const {
    loading: loadingPrescriptions,
    prescriptions,
    refetch: refetchPrescriptions
  } = getPrescriptions({ patientId: rawId });
  const {
    loading: loadingOrders,
    orders,
    refetch: refetchOrders
  } = getOrders({ patientId: rawId });

  useEffect(() => {
    setLoading(loadingPatient || loadingPrescriptions || loadingOrders);
  }, [loadingPatient, loadingPrescriptions, loadingOrders]);

  const sexMap: object = {
    MALE: 'Male',
    FEMALE: 'Female',
    UNKNOWN: 'Unknown'
  };

  // id passed into the url can be either the external id or our patient id, but many times we need our patient id
  const patientId = useMemo(() => patient?.id, [patient]);

  useEffect(() => {
    const refetchData = async () => {
      await refetchPatient({ id: patientId });
      await refetchPrescriptions({ patientId: patientId });
      await refetchOrders({ patientId: patientId });
    };
    refetchData();
  }, [patientId, refetchOrders, refetchPatient, refetchPrescriptions]);

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
          <CopyText text={rawId || ''} />
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
            to={`/patients/update/${patientId}`}
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
            to={`/prescriptions/new?patientId=${patientId}`}
            colorScheme="blue"
          >
            Create Prescription
          </Button>
        </Stack>
      }
    >
      <Card>
        <CardHeader>
          <Text fontWeight="medium" className="mp-mask">
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
            <InfoGrid name="Date of Birth">
              {loading ? (
                <SkeletonText skeletonHeight={5} noOfLines={1} width="100px" />
              ) : patient?.dateOfBirth ? (
                <Text fontSize="md" className="mp-mask">
                  {formatDateLongUTC(patient.dateOfBirth)}
                </Text>
              ) : (
                <Text fontSize="md" as="i" color="gray.500">
                  None
                </Text>
              )}
            </InfoGrid>

            <InfoGrid name="Sex">
              {loading ? (
                <SkeletonText skeletonHeight={5} noOfLines={1} width="100px" />
              ) : patient?.sex ? (
                <Text fontSize="md" className="mp-mask">
                  {sexMap[patient.sex as keyof object]}{' '}
                </Text>
              ) : (
                <Text fontSize="md" as="i" color="gray.500">
                  None
                </Text>
              )}
            </InfoGrid>

            <InfoGrid name="Gender">
              {loading ? (
                <SkeletonText skeletonHeight={5} noOfLines={1} width="100px" />
              ) : patient?.gender ? (
                <Text fontSize="md" className="mp-mask">
                  {patient.gender}
                </Text>
              ) : (
                <Text fontSize="md" as="i" color="gray.500">
                  None
                </Text>
              )}
            </InfoGrid>

            <InfoGrid name="Mobile Number">
              {loading ? (
                <SkeletonText skeletonHeight={5} noOfLines={1} width="100px" />
              ) : patient?.phone ? (
                <Link
                  fontSize="md"
                  href={`tel:${patient.phone}`}
                  isExternal
                  textDecoration="underline"
                  className="mp-mask"
                >
                  {formatPhone(patient.phone)}
                </Link>
              ) : (
                <Text fontSize="md" as="i" color="gray.500">
                  None
                </Text>
              )}
            </InfoGrid>

            <InfoGrid name="Email">
              {loading ? (
                <SkeletonText skeletonHeight={5} noOfLines={1} width="100px" />
              ) : patient?.email ? (
                <Link
                  fontSize="md"
                  href={`mailto:${patient.email}`}
                  isExternal
                  textDecoration="underline"
                  className="mp-mask"
                >
                  {patient.email}
                </Link>
              ) : (
                <Text fontSize="md" as="i" color="gray.500">
                  None
                </Text>
              )}
            </InfoGrid>
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
            <PatientPrescriptions loading={loading} prescriptions={prescriptions} />

            <SectionTitleRow
              headerText="Orders"
              rightElement={
                <Button
                  leftIcon={<FiPlus />}
                  aria-label="New Order"
                  as={RouterLink}
                  to={`/orders/new?patientId=${patientId}`}
                  colorScheme="blue"
                  size="sm"
                  isDisabled={loading}
                >
                  Create Order
                </Button>
              }
            />

            {loading ? (
              <SkeletonText skeletonHeight={20} noOfLines={1} width="300px" />
            ) : orders.length === 0 ? (
              <Text as="i" fontSize="sm" color="gray.500">
                No orders
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
