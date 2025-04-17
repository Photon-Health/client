import * as yup from 'yup';
import { Formik } from 'formik';

import { useState } from 'react';

import { Alert, AlertIcon, ModalCloseButton, useColorMode, VStack } from '@chakra-ui/react';

import { types, usePhoton } from '@photonhealth/react';

import { confirmWrapper } from '../../../components/GuardDialog';
import { PatientCard } from './PatientCard';
import { SelectPatientCard } from './SelectPatientCard';
import { SelectPrescriptionsCard } from './SelectPrescriptionsCard';
import { SelectPharmacyCard } from './SelectPharmacyCard';
import { PatientAddressCard } from './PatientAddressCard';
import { OrganizationSettings } from 'apps/app/src/gql/graphql';
import { graphql } from 'apps/app/src/gql';
import { useQuery } from '@apollo/client';

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
  orgSettings: Partial<OrganizationSettings> | null | undefined,
  patient: types.Patient,
  prescriptionIds: string
) => {
  // Create fulfillment options
  const sendToPatientEnabled = orgSettings?.providerUx?.enablePatientRouting ?? true;
  const pickupEnabled = orgSettings?.providerUx?.enablePickupPharmacies ?? true;
  const mailOrderEnabled = orgSettings?.providerUx?.enableDeliveryPharmacies ?? false;

  const fulfillmentOptions: FulfillmentOptions = [
    {
      name: 'Send to Patient',
      fulfillmentType: undefined,
      enabled: sendToPatientEnabled
    },
    {
      name: 'Local Pickup',
      fulfillmentType: types.FulfillmentType.PickUp,
      enabled: pickupEnabled
    },
    {
      name: 'Mail Order',
      fulfillmentType: types.FulfillmentType.MailOrder,
      enabled: mailOrderEnabled
    }
  ];

  // Initialize fulfillment
  type FulfillmentOrEmpty = types.FulfillmentType | '' | null | undefined;
  let initialFulfillmentType: FulfillmentOrEmpty = '';
  let initialPharmacyId = '';

  // Send to patient takes precedence over preferred pharmacy
  if (!sendToPatientEnabled && (pickupEnabled || mailOrderEnabled)) {
    const preferredPharmacy = patient?.preferredPharmacies?.[0];

    const enabledFulfillmentTypes: FulfillmentOrEmpty[] = fulfillmentOptions
      .filter((option) => option.enabled && option.fulfillmentType)
      .map((option) => option.fulfillmentType);

    if (preferredPharmacy) {
      // If preferred pharmacy has an enabled fulfillment type, make that the initial tab
      const preferedPharmacyFulfillmentTypes = preferredPharmacy?.fulfillmentTypes || [];
      const preferredTypeIsEnabled = preferedPharmacyFulfillmentTypes.find((type) =>
        enabledFulfillmentTypes.includes(type)
      );

      if (preferredTypeIsEnabled) {
        initialFulfillmentType = preferedPharmacyFulfillmentTypes[0];
        initialPharmacyId = preferredPharmacy.id;
      }
    }
    if (!initialFulfillmentType) {
      initialFulfillmentType = enabledFulfillmentTypes[0];
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

const orgSettingsQuery = graphql(/* GraphQL */ `
  query OrderFormOrgSettingsQuery {
    organization {
      settings {
        providerUx {
          enablePrescriberOrdering
          enablePatientRouting
          enablePickupPharmacies
          enableDeliveryPharmacies
        }
      }
    }
  }
`);

export const OrderForm = ({
  user,
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
  const { clinicalClient } = usePhoton();
  const { colorMode } = useColorMode();
  const [updatePreferredPharmacy, setUpdatePreferredPharmacy] = useState(false);
  const [updateAddress, setUpdateAddress] = useState(false);

  const { data } = useQuery(orgSettingsQuery, { client: clinicalClient });
  const orgSettings = data?.organization?.settings;
  const enablePrescriberOrdering = orgSettings?.providerUx?.enablePrescriberOrdering ?? true;

  const { initialFormValues, fulfillmentOptions } = initOrder(
    orgSettings,
    patient,
    prescriptionIds
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
            // determine if order is "Send to Patient" by checking if pharmacyId is set
            description: values.pharmacyId
              ? 'This order will be sent immediately to the pharmacy of choice.'
              : 'This order will be sent when the patient chooses a pharmacy.',
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

            <Alert status="error" hidden={enablePrescriberOrdering} mb={5}>
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
