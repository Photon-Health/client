import { useEffect, useCallback, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Flex,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useBreakpointValue,
  useColorModeValue
} from '@chakra-ui/react';

import { FiShoppingCart } from 'react-icons/fi';

import { usePhoton } from '@photonhealth/react';

import { PATIENT_FIELDS } from '../../../model/fragments';
import { OrderForm } from './components/OrderForm';

import jwtDecode from 'jwt-decode';

const envName = process.env.REACT_APP_ENV_NAME as 'boson' | 'neutron' | 'photon';
const { fulfillmentSettings } = require(`../../../configs/fulfillment.${envName}.ts`);

export const NewOrder = () => {
  const [params] = useSearchParams();
  const patientId = params.get('patientId') || '';
  const prescriptionIds = params.get('prescriptionIds') || '';

  const { createOrder, getPatient, updatePatient, removePatientPreferredPharmacy, user, getToken } =
    usePhoton();

  const [auth0UserId, setAuth0UserId] = useState<string>('');
  const getAuth0UserId = async () => {
    const token = await getToken();

    if (token) {
      const decoded: { sub: string } = jwtDecode(token);
      setAuth0UserId(decoded.sub);
    }
  };

  useEffect(() => {
    if (!auth0UserId) {
      getAuth0UserId();
    }
  });

  const [createOrderMutation, { loading: loadingCreateOrder, error }] = createOrder({
    refetchQueries: ['getOrders'],
    awaitRefetchQueries: true
  });

  const [updatePatientMutation] = updatePatient({
    refetchQueries: ['getPatient'],
    awaitRefetchQueries: true
  });

  const [removePatientPreferredPharmacyMutation] = removePatientPreferredPharmacy({
    refetchQueries: ['getPatient'],
    awaitRefetchQueries: true
  });

  /**
   * Used refetch here in place of "patients" directly on getPatient because in
   * 1/5 refreshes the sdk was not returning the patient with the id contained
   * in the url
   */

  const { refetch } = getPatient({
    id: patientId || '',
    fragment: { PatientFields: PATIENT_FIELDS }
  });

  const [loadingPatient, setLoadingPatient] = useState(false);
  const [patient, setPatient] = useState<any>(undefined);

  const fetchPatient = async () => {
    setLoadingPatient(true);
    const result = await refetch({
      id: patientId || '',
      fragment: { PatientFields: PATIENT_FIELDS }
    });
    if (result) {
      setPatient(result.data.patient);
    }
    setLoadingPatient(false);
  };

  useEffect(() => {
    if (patientId) {
      fetchPatient();
    } else {
      setPatient(undefined);
    }
  }, [patientId]);

  const navigate = useNavigate();
  const onClose = () => {
    navigate('/orders');
  };

  const [, updateState] = useState<object>();
  const forceUpdate = useCallback(() => updateState({}), []);

  const [showAddress, setShowAddress] = useState(true);

  useEffect(() => {
    forceUpdate();
  }, [patientId]);

  useEffect(() => {
    if (patientId && patient?.address) {
      setShowAddress(false);
    } else {
      setShowAddress(true);
    }
  }, [patient?.address]);

  const background = useColorModeValue('white', 'dark');
  const bodyBackground = useColorModeValue('#f7f4f4', 'bg-canvas');
  const border = useColorModeValue('gray.200', 'gray.800');
  const isMobile = useBreakpointValue({ base: true, sm: false });

  const orderCreationEnabled =
    typeof fulfillmentSettings[user.org_id]?.sendOrder !== 'undefined'
      ? fulfillmentSettings[user.org_id]?.sendOrder
      : fulfillmentSettings.default.sendOrder;

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="full"
      closeOnOverlayClick={false}
      closeOnEsc={false}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent backgroundColor={bodyBackground} alignSelf="flex-start">
        <ModalHeader
          borderBottom="1px solid"
          background={background}
          borderColor={border}
          position="sticky"
        >
          <Flex flex="1 1 0">
            <Box flex="1" />
            <HStack>
              <FiShoppingCart />
              <Text textAlign="center">New Order</Text>
            </HStack>
            <Box flex="1" textAlign="right">
              <Button
                flex="1"
                type="submit"
                colorScheme="brand"
                size="sm"
                form="order-form"
                isLoading={loadingCreateOrder}
                loadingText="Sending"
                isDisabled={!orderCreationEnabled}
              >
                Send Order
              </Button>
            </Box>
          </Flex>
        </ModalHeader>
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error.message}
          </Alert>
        )}
        <ModalBody
          overflow="auto"
          padding={0}
          backgroundColor={bodyBackground}
          height="100vh"
          justifyContent="center"
        >
          <Flex justifyContent="center">
            <Box width={isMobile ? '100%' : 'xl'} padding={isMobile ? 4 : 8}>
              <OrderForm
                user={user}
                auth0UserId={auth0UserId}
                loading={loadingPatient}
                patient={patient}
                onClose={onClose}
                prescriptionIds={prescriptionIds}
                createOrderMutation={createOrderMutation}
                updatePatientMutation={updatePatientMutation}
                removePatientPreferredPharmacyMutation={removePatientPreferredPharmacyMutation}
                showAddress={showAddress}
                setShowAddress={setShowAddress}
              />
            </Box>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
