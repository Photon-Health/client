import React from 'react';
import {
  HStack,
  ModalContent,
  ModalHeader,
  ModalBody,
  Alert,
  AlertIcon,
  VStack,
  Text,
  Button,
  ModalFooter,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  useToast
} from '@chakra-ui/react';
import * as yup from 'yup';
import { rolesSchema } from '../utils/Roles';
import { useMutation } from '@apollo/client';
import { usePhoton } from '@photonhealth/react';
import { FragmentType, graphql, useFragment } from 'apps/app/src/gql';
import { FormikStateSelect, yupStateSchema } from '../utils/States';
import { FormikTouched, FormikErrors, ErrorMessage, Field, Formik } from 'formik';
import { Role } from 'packages/sdk/dist/types';

export const userFragment = graphql(/* GraphQL */ `
  fragment UserFragment on User {
    id
    npi
    phone
    fax
    email
    address {
      street1
      street2
      state
      postalCode
      country
      city
    }
    name {
      first
      full
      last
      middle
      title
    }
    roles {
      description
      id
      name
    }
  }
`);

interface EditProfileActionProps {
  user: FragmentType<typeof userFragment>;
  onClose: () => void;
}

const UpdateMyProfileMutation = graphql(/* GraphQL */ `
  mutation UpdateMyProfile($updateMyProfileInput: ProfileInput!) {
    updateMyProfile(input: $updateMyProfileInput)
  }
`);

const hasPrescriberRole = (roles: { value: string; label: string }[]) =>
  roles.some((r) => r.label === 'Prescriber');

const profileSchema = yup
  .object({
    name: yup
      .object({
        title: yup.string(),
        first: yup.string().required('first name is required'),
        middle: yup.string(),
        last: yup.string().required('last name is required')
      })
      .required('Please enter an address'),
    fax: yup
      .string()
      .matches(/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/, {
        message: 'Please enter a valid fax number'
      }),
    email: yup.string().email('Invalid email').required('email is required for providers'),
    roles: rolesSchema.required().min(1, 'Must have at least one role'),
    provider: yup
      .object({
        npi: yup
          .string()
          .required('NPI is required for prescribers')
          .matches(/^[0-9]+$/, { message: 'Invalid NPI' }),
        address: yup
          .object({
            street1: yup.string().required('Address is required'),
            street2: yup.string(),
            city: yup.string().required('City is required'),
            state: yupStateSchema,
            postalCode: yup
              .string()
              .required('Zip is required')
              .matches(/^[0-9]{5}(?:-[0-9]{4})?$/, { message: 'Enter a valid zipcode' })
          })
          .required('Please enter an address'),
        phone: yup
          .string()
          .matches(
            /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/,
            { message: 'Please enter a valid phone number' }
          )
          .required('Please enter a valid phone number')
      })
      .notRequired()
      .default(undefined)
      .when('roles', (roles: { value: string; label: string }[], schema) => {
        return hasPrescriberRole(roles)
          ? schema.required(
              "Address, NPI and phone are required for users with 'Prescriber' permissions"
            )
          : schema.notRequired();
      })
  })
  // If not a prescriber, set the provider to undefined
  .transform((value) => {
    if (hasPrescriberRole(value.roles)) {
      return value;
    }
    return { ...value, provider: undefined };
  });

type ProfileYupType = yup.InferType<typeof profileSchema>;
type ProviderYupType = ProfileYupType['provider'];
type ProviderFormikTouchedType = FormikTouched<ProviderYupType>;
type ProviderFormikErrorsType = FormikErrors<ProviderYupType>;

export const EditProfileAction: React.FC<EditProfileActionProps> = ({ user, onClose }) => {
  const toast = useToast();
  const { clinicalClient } = usePhoton();
  const currentUser = useFragment(userFragment, user);
  const [updateMyProfile, { error }] = useMutation(UpdateMyProfileMutation, {
    client: clinicalClient,
    refetchQueries: ['MeProfileQuery']
  });

  const handleSaveRoles = (formVariables: any) => {
    updateMyProfile({
      variables: {
        updateMyProfileInput: {
          name: formVariables.variables.name ?? currentUser?.name,
          address: formVariables.variables.provider.address ?? currentUser?.address,
          email: formVariables.variables.email ?? currentUser?.email,
          npi: formVariables.variables.provider.npi ?? currentUser?.npi,
          phone: formVariables.variables.provider.phone ?? currentUser?.phone,
          fax: formVariables.variables.fax ?? currentUser?.fax
        }
      }
    });

    onClose();
  };

  function mapAndSortRoles(
    roles: Role[]
  ): { value: string; label: string; description?: string }[] {
    const mappedRoles = roles.map(({ name, id, description }) => ({
      value: id,
      label: name ?? id,
      description: description ?? undefined
    }));
    const sortedRoles = mappedRoles.sort();
    return sortedRoles;
  }

  const initialValues: yup.InferType<typeof profileSchema> = {
    name: {
      title: currentUser?.name?.title ?? undefined,
      first: currentUser?.name?.first ?? '',
      middle: currentUser?.name?.middle ?? undefined,
      last: currentUser?.name?.last ?? ''
    },
    fax: currentUser?.fax ?? undefined,
    email: currentUser?.email ?? '',
    roles: mapAndSortRoles(currentUser?.roles ?? []),
    provider: {
      npi: currentUser?.npi ?? '',
      address: {
        street1: currentUser?.address?.street1 ?? '',
        street2: currentUser?.address?.street2 ?? undefined,
        city: currentUser?.address?.city ?? '',
        state: { value: (currentUser?.address?.state as string) ?? '' },
        postalCode: currentUser?.address?.postalCode ?? ''
      },
      phone: currentUser?.phone ?? ''
    }
  };

  return (
    <ModalContent>
      <ModalHeader>
        <VStack spacing={3} align="stretch">
          <Text fontSize="bg">Assign roles to user</Text>
          <Text fontSize="sm" color="gray.500">
            Update Profile
          </Text>
        </VStack>
      </ModalHeader>
      <ModalBody>
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error.message}
          </Alert>
        )}
        {currentUser && (
          <Formik
            validateOnBlur
            initialValues={initialValues}
            validationSchema={profileSchema}
            onSubmit={async (values, { validateForm, resetForm }) => {
              await validateForm(values);
              await handleSaveRoles({
                variables: {
                  name: { ...values.name },
                  fax: values.fax,
                  email: values.email,
                  roles: values.roles,
                  ...(values.provider == null
                    ? {}
                    : {
                        provider: {
                          ...values.provider,
                          address: {
                            ...values.provider.address,
                            state: values.provider.address?.state?.value,
                            country: 'US'
                          }
                        }
                      })
                }
              });
              toast({
                title: 'Role updated',
                status: 'success',
                duration: 4000
              });
              resetForm();
              onClose();
            }}
          >
            {({ setFieldValue, handleSubmit, errors, touched, values, setFieldTouched }) => {
              const providerErrors = errors.provider as ProviderFormikErrorsType | undefined;
              const providerTouched = touched.provider as ProviderFormikTouchedType | undefined;
              return (
                <form onSubmit={handleSubmit} noValidate>
                  <VStack spacing={2} align="stretch">
                    <>
                      <FormControl isInvalid={!!errors?.name?.title && touched.name?.title} pb="4">
                        <FormLabel htmlFor="name.title" mb={1}>
                          Title
                        </FormLabel>
                        <Field name="name.title" default={currentUser?.name?.title} as={Input} />
                        <ErrorMessage name="name.title" component={FormErrorMessage} />
                      </FormControl>
                      <FormControl
                        isRequired
                        isInvalid={!!errors?.name?.first && touched.name?.first}
                        pb="4"
                      >
                        <FormLabel htmlFor="name.title" mb={1}>
                          First Name
                        </FormLabel>
                        <Field name="name.first" default={currentUser?.name?.first} as={Input} />
                        <ErrorMessage name="name.first" component={FormErrorMessage} />
                      </FormControl>
                      <FormControl
                        isInvalid={!!errors?.name?.middle && touched.name?.middle}
                        pb="4"
                      >
                        <FormLabel htmlFor="name.middle" mb={1}>
                          Middle Name
                        </FormLabel>
                        <Field name="name.middle" default={currentUser?.name?.middle} as={Input} />
                        <ErrorMessage name="name.middle" component={FormErrorMessage} />
                      </FormControl>
                      <FormControl
                        isRequired
                        isInvalid={!!errors?.name?.first && touched.name?.first}
                        pb="4"
                      >
                        <FormLabel htmlFor="name.last" mb={1}>
                          Last Name
                        </FormLabel>

                        <Field name="name.last" default={currentUser?.name?.last} as={Input} />
                        <ErrorMessage name="name.last" component={FormErrorMessage} />
                      </FormControl>
                      <FormControl isRequired isInvalid={!!errors?.email && touched?.email} pb="4">
                        <FormLabel htmlFor="email" mb={1}>
                          Email
                        </FormLabel>

                        <Field name="email" default={currentUser?.email} as={Input} />
                        <ErrorMessage name="email" component={FormErrorMessage} />
                      </FormControl>
                      <FormControl
                        isRequired
                        isInvalid={!!providerErrors?.npi && providerTouched?.npi}
                        pb="4"
                      >
                        <FormLabel htmlFor="provider.npi" mb={1}>
                          NPI
                        </FormLabel>

                        <Field name="provider.npi" default={currentUser?.npi} as={Input} />
                        <ErrorMessage name="provider.npi" component={FormErrorMessage} />
                      </FormControl>
                      <FormControl
                        isRequired
                        isInvalid={
                          !!providerErrors?.address?.street1 && providerTouched?.address?.street1
                        }
                        pb="4"
                      >
                        <FormLabel htmlFor="provider.address.street1" mb={1}>
                          Address 1
                        </FormLabel>
                        <Field
                          name="provider.address.street1"
                          default={currentUser?.address?.street1}
                          as={Input}
                        />
                        <ErrorMessage
                          name="provider.address.street1"
                          component={FormErrorMessage}
                        />
                      </FormControl>
                      <FormControl
                        isInvalid={
                          !!providerErrors?.address?.street2 && providerTouched?.address?.street2
                        }
                        pb="4"
                      >
                        <FormLabel htmlFor="provider.address.street2" mb={1}>
                          Address 2
                        </FormLabel>
                        <Field
                          name="provider.address.street2"
                          default={currentUser?.address?.street2}
                          as={Input}
                        />
                        <ErrorMessage
                          name="provider.address.street2"
                          component={FormErrorMessage}
                        />
                      </FormControl>
                      <FormControl
                        isRequired
                        isInvalid={
                          !!providerErrors?.address?.city && providerTouched?.address?.city
                        }
                        pb="4"
                      >
                        <FormLabel htmlFor="provider.address.city" mb={1}>
                          City
                        </FormLabel>
                        <Field
                          name="provider.address.city"
                          default={currentUser?.address?.city}
                          as={Input}
                        />
                        <ErrorMessage name="provider.address.city" component={FormErrorMessage} />
                      </FormControl>
                      <FormControl
                        isRequired
                        isInvalid={
                          (!!providerErrors?.address?.state?.value &&
                            providerTouched?.address?.state?.value) ??
                          false
                        }
                        pb="4"
                      >
                        <FormLabel htmlFor="provider.address.state" mb={1}>
                          State {values.provider?.address?.state?.value}
                        </FormLabel>
                        <FormikStateSelect
                          value={
                            values.provider?.address?.state?.value
                              ? { value: values.provider?.address?.state?.value }
                              : undefined
                          }
                          setFieldTouched={setFieldTouched}
                          setFieldValue={setFieldValue}
                          fieldName="provider.address.state"
                        />
                        <ErrorMessage name="provider.address.state" component={FormErrorMessage} />
                      </FormControl>
                      <FormControl
                        isRequired
                        isInvalid={
                          !!providerErrors?.address?.postalCode &&
                          providerTouched?.address?.postalCode
                        }
                        pb="4"
                      >
                        <FormLabel htmlFor="provider.address.postalCode" mb={1}>
                          Zip Code
                        </FormLabel>
                        <Field
                          name="provider.address.postalCode"
                          default={currentUser?.address?.postalCode}
                          as={Input}
                        />
                        <ErrorMessage
                          name="provider.address.postalCode"
                          component={FormErrorMessage}
                        />
                      </FormControl>
                      <FormControl
                        isRequired
                        isInvalid={!!providerErrors?.phone && providerTouched?.phone}
                        pb="4"
                      >
                        <FormLabel htmlFor="provider.phone" mb={1}>
                          Phone
                        </FormLabel>
                        <Field name="provider.phone" default={currentUser?.phone} as={Input} />
                        <ErrorMessage name="provider.phone" component={FormErrorMessage} />
                      </FormControl>
                      <FormControl isInvalid={!!errors?.fax && touched?.fax} pb="4">
                        <FormLabel htmlFor="fax" mb={1}>
                          Fax
                        </FormLabel>
                        <Field name="fax" default={currentUser?.fax} as={Input} />
                        <ErrorMessage name="fax" component={FormErrorMessage} />
                      </FormControl>
                    </>
                  </VStack>
                  <ModalFooter px="0">
                    <VStack>
                      <HStack>
                        <Button variant="outline" onClick={onClose}>
                          Cancel
                        </Button>

                        <Button
                          type="submit"
                          colorScheme="blue"
                          isDisabled={
                            !!errors.email || !!(errors.provider && hasPrescriberRole(values.roles))
                          }
                        >
                          Update Profile
                        </Button>
                      </HStack>
                    </VStack>
                  </ModalFooter>
                </form>
              );
            }}
          </Formik>
        )}
      </ModalBody>
    </ModalContent>
  );
};
