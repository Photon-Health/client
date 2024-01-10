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
  Box,
  Button,
  ModalFooter,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  useToast
} from '@chakra-ui/react';
import * as yup from 'yup';
import { rolesSchema, RolesSelect } from '../utils/Roles';
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

interface EditRolesActionProps {
  user: FragmentType<typeof userFragment>;
  onClose: () => void;
}

const SetUserRolesMutation = graphql(/* GraphQL */ `
  mutation SetUserRoles($userId: ID!, $roles: [ID!]!) {
    setUserRoles(userId: $userId, roles: $roles)
  }
`);

const UpdateProviderProfileMutation = graphql(/* GraphQL */ `
  mutation UpdateProviderProfile(
    $providerId: ID!
    $updateProviderProfileInput: UpdateProviderProfileInput!
  ) {
    updateProviderProfile(providerId: $providerId, input: $updateProviderProfileInput)
  }
`);

const hasPrescriberRole = (roles: { value: string; label: string }[]) =>
  roles.some((r) => r.label === 'Prescriber');

const roleSchema = yup
  .object({
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

type RoleYupType = yup.InferType<typeof roleSchema>;
type ProviderYupType = RoleYupType['provider'];
type ProviderFormikTouchedType = FormikTouched<ProviderYupType>;
type ProviderFormikErrorsType = FormikErrors<ProviderYupType>;

export const EditRolesAction: React.FC<EditRolesActionProps> = ({ user, onClose }) => {
  const toast = useToast();
  const { clinicalClient } = usePhoton();
  const userData = useFragment(userFragment, user);
  const [updateProviderProfile] = useMutation(UpdateProviderProfileMutation, {
    client: clinicalClient,
    refetchQueries: []
  });
  const [setUserRoles, { error }] = useMutation(SetUserRolesMutation, {
    client: clinicalClient,
    refetchQueries: ['UsersListQuery']
  });

  const handleSaveRoles = (formVariables: any) => {
    if (
      hasPrescriberRole(formVariables.variables.roles) &&
      (userData?.npi == undefined || userData?.address == undefined || userData?.email == undefined)
    ) {
      updateProviderProfile({
        variables: {
          providerId: userData?.id ?? '',
          updateProviderProfileInput: {
            address: formVariables.variables.provider.address ?? userData?.address,
            email: formVariables.variables.email ?? userData?.email,
            npi: formVariables.variables.provider.npi ?? userData?.npi,
            phone: formVariables.variables.phone ?? userData?.phone
          }
        }
      });
    }
    setUserRoles({
      variables: {
        userId: userData?.id ?? '',
        roles: formVariables.variables.roles.map((role: any) => role.value)
      }
    });
    onClose;
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

  const initialValues: yup.InferType<typeof roleSchema> = {
    email: userData?.email ?? '',
    roles: mapAndSortRoles(userData?.roles ?? []),
    provider: {
      npi: userData?.npi ?? '',
      address: {
        street1: userData?.address?.street1 ?? '',
        street2: userData?.address?.street2 ?? undefined,
        city: userData?.address?.city ?? '',
        state: { value: (userData?.address?.state as string) ?? '' },
        postalCode: userData?.address?.postalCode ?? ''
      },
      phone: userData?.phone ?? ''
    }
  };

  return (
    <ModalContent>
      <ModalHeader>
        <VStack spacing={3} align="stretch">
          <Text fontSize="bg">Assign roles to user</Text>
          <Text fontSize="sm" color="gray.500">
            Add or remove roles for this user
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
        <Box
          px="0"
          border={'1px solid var(--chakra-colors-gray-100)'}
          backgroundColor="gray.100"
          boxShadow={'base'}
          borderRadius={10}
        >
          <VStack m={3} mt={2} p={[2, 2]} spacing={2} align="stretch">
            <Text fontSize="md" fontWeight={'semibold'}>
              {userData?.name?.full}
            </Text>
            <Text fontSize="sm">{userData?.email}</Text>
          </VStack>
        </Box>
        {userData && (
          <Formik
            validateOnBlur
            initialValues={initialValues}
            validationSchema={roleSchema}
            onSubmit={async (values, { validateForm, resetForm }) => {
              await validateForm(values);
              await handleSaveRoles({
                variables: {
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
                    <FormControl isInvalid={!!errors.roles && !!touched.roles} pb="4" isRequired>
                      <FormLabel htmlFor="roles" m={2} mt={3}>
                        Roles
                      </FormLabel>
                      <RolesSelect
                        onChange={(newValue) => {
                          setFieldValue('roles', newValue);
                          setFieldTouched('roles');
                        }}
                        onBlur={() => setFieldTouched('roles')}
                        value={values.roles}
                      />
                      <ErrorMessage name="roles" component={FormErrorMessage} />
                    </FormControl>

                    {hasPrescriberRole(values.roles) &&
                      (userData?.npi == undefined ||
                        userData?.address == undefined ||
                        userData?.email == undefined) && (
                        <>
                          <FormControl
                            isRequired
                            isInvalid={!!providerErrors?.npi && providerTouched?.npi}
                            pb="4"
                          >
                            <FormLabel htmlFor="provider.npi" mb={1}>
                              NPI
                            </FormLabel>

                            <Field name="provider.npi" default={userData?.npi} as={Input} />
                            <ErrorMessage name="provider.npi" component={FormErrorMessage} />
                          </FormControl>
                          <FormControl
                            isRequired
                            isInvalid={
                              !!providerErrors?.address?.street1 &&
                              providerTouched?.address?.street1
                            }
                            pb="4"
                          >
                            <FormLabel htmlFor="provider.address.street1" mb={1}>
                              Address 1
                            </FormLabel>
                            <Field
                              name="provider.address.street1"
                              default={userData?.address?.street1}
                              as={Input}
                            />
                            <ErrorMessage
                              name="provider.address.street1"
                              component={FormErrorMessage}
                            />
                          </FormControl>
                          <FormControl
                            isInvalid={
                              !!providerErrors?.address?.street2 &&
                              providerTouched?.address?.street2
                            }
                            pb="4"
                          >
                            <FormLabel htmlFor="provider.address.street2" mb={1}>
                              Address 2
                            </FormLabel>
                            <Field
                              name="provider.address.street2"
                              default={userData?.address?.street2}
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
                              default={userData?.address?.city}
                              as={Input}
                            />
                            <ErrorMessage
                              name="provider.address.city"
                              component={FormErrorMessage}
                            />
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
                            <ErrorMessage
                              name="provider.address.state"
                              component={FormErrorMessage}
                            />
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
                              default={userData?.address?.postalCode}
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
                            <Field name="provider.phone" default={userData?.phone} as={Input} />
                            <ErrorMessage name="provider.phone" component={FormErrorMessage} />
                          </FormControl>
                        </>
                      )}
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
                            !!errors.roles ||
                            !!errors.email ||
                            !!(errors.provider && hasPrescriberRole(values.roles)) ||
                            !touched.roles
                          }
                        >
                          Update Role
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
