import * as yup from 'yup';
import { Formik } from 'formik';

import { useState } from 'react';

import { Alert, AlertIcon, ModalCloseButton, useColorMode, VStack } from '@chakra-ui/react';

import { types } from '@photonhealth/react';

import { confirmWrapper } from '../../../components/GuardDialog';
import { PatientCard } from './PatientCard';
import { SelectPatientCard } from './SelectPatientCard';
import { SelectPrescriptionsCard } from './SelectPrescriptionsCard';
import { SelectPharmacyCard } from './SelectPharmacyCard';
import { PatientAddressCard } from './PatientAddressCard';

import { fulfillmentConfig } from '../../../../configs/fulfillment';

const EMPTY_FORM_VALUES = {
  patientId: '',
  fills: [],
  fulfillmentType: '',
  pharmacyId: '',
  saveAsPreferredPharmacy: false,
  address: {
    street1: '',
    street2: '',
    postalCode: '',
    country: 'USA',
    state: '',
    city: ''
  }
};

const orderSchema = yup.object({
  patientId: yup.string().required('Please select a patient...'),
  fills: yup
    .array()
    .of(
      yup.object({
        prescriptionId: yup.string().required()
      })
    )
    .required()
    .test({
      message: 'Please select at least one prescription to fill...',
      test: (arr) => arr?.length !== 0
    }),
  fulfillmentType: yup.string().nullable(),
  pharmacyId: yup.string().when('fulfillmentType', {
    is: (fulfillmentType: types.FulfillmentType) => !!fulfillmentType,
    then: yup.string().required()
  }),
  address: yup
    .object({
      street1: yup.string().required('Please enter an address...'),
      street2: yup.string().nullable(),
      postalCode: yup
        .string()
        .required('Please enter a zip code...')
        .matches(/^[0-9]+$/, 'Must be only digits')
        .min(5, 'Must be exactly 5 digits')
        .max(5, 'Must be exactly 5 digits'),
      country: yup.string().required('Please enter a country...'),
      state: yup.string().required('Please enter a state...'),
      city: yup.string().required('Please enter a city...')
    })
    .required()
});

interface OrderFormProps {
  user: any;
  auth0UserId: string;
  loading: boolean;
  patient: any;
  onClose: () => void;
  prescriptionIds: string;
  createOrderMutation: any;
  updatePatientMutation: any;
  removePatientPreferredPharmacyMutation: any;
  showAddress: boolean;
  setShowAddress: any;
}

export const OrderForm = ({
  user,
  auth0UserId,
  loading,
  patient,
  onClose,
  prescriptionIds,
  createOrderMutation,
  updatePatientMutation,
  removePatientPreferredPharmacyMutation,
  showAddress,
  setShowAddress
}: OrderFormProps) => {
  const { colorMode } = useColorMode();
  const [updatePreferredPharmacy, setUpdatePreferredPharmacy] = useState(false);

  const onCancel = async (dirty: Boolean) => {
    if (!dirty) onClose();
    else if (
      await confirmWrapper('Lose unsaved order?', {
        description: 'You will not be able to recover unsaved order information.',
        cancelText: 'Keep Editing',
        confirmText: 'Yes, Cancel',
        darkMode: colorMode !== 'light'
      })
    ) {
      onClose();
    }
  };

  const initialValues = {
    ...EMPTY_FORM_VALUES,
    patientId: patient?.id || '',
    fills: prescriptionIds
      ? prescriptionIds.split(',').map((x: string) => ({ prescriptionId: x }))
      : [],
    fulfillmentType: 'PICK_UP',
    pharmacyId: patient?.preferredPharmacies?.length > 0 ? patient.preferredPharmacies[0].id : '',
    address: {
      street1: patient?.address?.street1 || '',
      street2: patient?.address?.street2 || '',
      postalCode: patient?.address?.postalCode || '',
      country: patient?.address?.country || 'US',
      state: patient?.address?.state || '',
      city: patient?.address?.city || ''
    }
  };

  const envName = process.env.REACT_APP_ENV_NAME as 'boson' | 'neutron' | 'photon';
  const orderCreationEnabled =
    typeof fulfillmentConfig[envName][user.org_id]?.sendOrder !== 'undefined'
      ? fulfillmentConfig[envName][user.org_id]?.sendOrder
      : fulfillmentConfig[envName].default.sendOrder;

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={orderSchema}
      onSubmit={async (values, { validateForm, setSubmitting }) => {
        validateForm(values);

        if (
          await confirmWrapper('Send Order?', {
            description: 'This order will be immediately sent to the pharmacy of choice.',
            cancelText: 'Keep Editing',
            confirmText: 'Yes, Send Order',
            darkMode: colorMode !== 'light'
          })
        ) {
          setSubmitting(true);
          createOrderMutation({ variables: values, onCompleted: onClose });

          // if the user has selected to save the pharmacy as their preferred pharmacy
          if (updatePreferredPharmacy) {
            if (patient?.preferredPharmacies?.length > 0) {
              // remove the current preferred pharmacy
              removePatientPreferredPharmacyMutation({
                variables: {
                  patientId: patient.id,
                  pharmacyId: patient?.preferredPharmacies[0].id
                }
              });
            }
            // add the new preferred pharmacy to the patient
            updatePatientMutation({
              variables: {
                id: patient.id,
                preferredPharmacies: [values.pharmacyId]
              }
            });
          }
        } else {
          setSubmitting(false);
        }
      }}
    >
      {({ values, setFieldValue, handleSubmit, dirty, errors, touched }) => {
        return (
          <form onSubmit={handleSubmit} noValidate id="order-form">
            <ModalCloseButton
              left="4"
              top="4"
              right="unset"
              onClick={async (e) => {
                e.preventDefault();
                await onCancel(dirty);
              }}
            />

            <Alert status="error" hidden={orderCreationEnabled} mb={5}>
              <AlertIcon />
              You are not allowed to create orders via the Photon App.
            </Alert>
            <VStack spacing={6} align="stretch">
              {values.patientId ? (
                <PatientCard loading={loading} patient={patient} />
              ) : (
                <SelectPatientCard errors={errors} touched={touched} />
              )}

              <PatientAddressCard
                loading={loading}
                address={values.address}
                setFieldValue={setFieldValue}
                errors={errors}
                touched={touched}
                showAddress={showAddress}
                setShowAddress={setShowAddress}
              />

              <SelectPharmacyCard
                user={user}
                auth0UserId={auth0UserId}
                updatePreferredPharmacy={updatePreferredPharmacy}
                setUpdatePreferredPharmacy={setUpdatePreferredPharmacy}
                pharmacyId={values.pharmacyId}
                address={values.address}
                errors={errors}
                touched={touched}
                patient={patient}
                setFieldValue={setFieldValue}
              />

              <SelectPrescriptionsCard
                patientId={values.patientId}
                prescriptionIds={prescriptionIds?.split(',').filter((id) => id) || []}
                errors={errors}
                touched={touched}
              />
            </VStack>
          </form>
        );
      }}
    </Formik>
  );
};
