import * as yup from 'yup';
import { Formik } from 'formik';

import { useState } from 'react';

import { Alert, AlertIcon, ModalCloseButton, useColorMode, VStack } from '@chakra-ui/react';

import { types } from '@photonhealth/react';
import { getSettings } from '@client/settings';

import { confirmWrapper } from '../../../components/GuardDialog';
import { PatientCard } from './PatientCard';
import { SelectPatientCard } from './SelectPatientCard';
import { SelectPrescriptionsCard } from './SelectPrescriptionsCard';
import { SelectPharmacyCard } from './SelectPharmacyCard';
import { PatientAddressCard } from './PatientAddressCard';

const envName = process.env.REACT_APP_ENV_NAME as 'boson' | 'neutron' | 'photon';
const settings = getSettings(envName);

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
        .matches(/^\d{5}(-\d{4})?$/, 'Must be a valid zip code...'),
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
  patient: types.Patient;
  onClose: () => void;
  prescriptionIds: string;
  createOrderMutation: any;
  updatePatientMutation: any;
  removePatientPreferredPharmacyMutation: any;
  showAddress: boolean;
  setShowAddress: any;
}

export type FulfillmentOptions = {
  name: string;
  enabled: boolean;
  fulfillmentType: types.FulfillmentType | undefined;
}[];

const initOrder = (
  orgSettings: any,
  patient: types.Patient,
  prescriptionIds: string,
  auth0UserId: string
) => {
  // Create fulfillment options
  const sendToPatientUsers = orgSettings.sendToPatientUsers as string[];
  const sendToPatientEnabled =
    orgSettings.sendToPatient || sendToPatientUsers.includes(auth0UserId);

  const fulfillmentOptions: FulfillmentOptions = [
    {
      name: 'Send to Patient',
      fulfillmentType: undefined,
      enabled: sendToPatientEnabled
    },
    {
      name: 'Local Pickup',
      fulfillmentType: types.FulfillmentType.PickUp,
      enabled: orgSettings.pickUp as boolean
    },
    {
      name: 'Mail Order',
      fulfillmentType: types.FulfillmentType.MailOrder,
      enabled: orgSettings.mailOrder as boolean
    }
  ];

  // Initialize fulfillment
  let initialFulfillmentType: any = '';
  let initialPharmacyId = '';

  // Send to patient takes precedence over preferred pharmacy
  if (!sendToPatientEnabled && (orgSettings.pickUp || orgSettings.mailOrder)) {
    const preferredPharmacy = patient?.preferredPharmacies?.[0];

    if (preferredPharmacy) {
      // If preferred pharmacy has an enabled fulfillment type, make that the initial tab
      const enabledTypes: string[] = fulfillmentOptions.reduce((acc: any, curr: any) => {
        if (curr.enabled && curr.fulfillmentType) {
          return [...acc, curr.fulfillmentType];
        }
        return [...acc];
      }, []);
      initialFulfillmentType =
        preferredPharmacy?.fulfillmentTypes && preferredPharmacy?.fulfillmentTypes.length > 0
          ? preferredPharmacy?.fulfillmentTypes?.find((type: any) => enabledTypes.includes(type))
          : '';

      if (initialFulfillmentType) {
        initialPharmacyId = preferredPharmacy.id;
      }
    }
  }

  const initialFormValues: any = {
    ...EMPTY_FORM_VALUES,
    patientId: patient?.id || '',
    fills: prescriptionIds
      ? prescriptionIds.split(',').map((x: string) => ({ prescriptionId: x }))
      : [],
    fulfillmentType: initialFulfillmentType,
    pharmacyId: initialPharmacyId,
    address: {
      street1: patient?.address?.street1 || '',
      street2: patient?.address?.street2 || '',
      postalCode: patient?.address?.postalCode || '',
      country: patient?.address?.country || 'US',
      state: patient?.address?.state || '',
      city: patient?.address?.city || ''
    }
  };

  return { initialFormValues, fulfillmentOptions };
};

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
  const [updateAddress, setUpdateAddress] = useState(false);

  const orgSettings = user.org_id in settings ? settings[user.org_id] : settings.default;

  const { initialFormValues, fulfillmentOptions } = initOrder(
    orgSettings,
    patient,
    prescriptionIds,
    auth0UserId
  );

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

  return (
    <Formik
      enableReinitialize
      initialValues={initialFormValues}
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

          // if the user has selected to set the customer's address
          if (updateAddress) {
            updatePatientMutation({
              variables: {
                id: patient.id,
                address: { ...values.address }
              }
            });
          }

          // if the user has selected to save the pharmacy as their preferred pharmacy
          if (updatePreferredPharmacy) {
            if (patient?.preferredPharmacies && patient?.preferredPharmacies?.length > 0) {
              // remove the current preferred pharmacy
              removePatientPreferredPharmacyMutation({
                variables: {
                  patientId: patient.id,
                  pharmacyId: patient?.preferredPharmacies?.[0]?.id
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
      {({ values, setFieldValue, handleSubmit, dirty, errors, touched, setTouched }) => {
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

            <Alert status="error" hidden={orgSettings.sendOrder} mb={5}>
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
                updateAddress={updateAddress}
                setUpdateAddress={setUpdateAddress}
                setTouched={setTouched}
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
                tabsList={fulfillmentOptions}
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
