import { useMutation } from '@apollo/client';
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Text,
  VStack,
  useToast
} from '@chakra-ui/react';
import { usePhoton } from '@photonhealth/react';
import { FragmentType, graphql, useFragment } from 'apps/app/src/gql';
import { AddressInput } from 'apps/app/src/gql/graphql';
import { StyledToast } from 'apps/app/src/views/components/StyledToast';
import { ErrorMessage, Field, Formik, FormikErrors, FormikTouched } from 'formik';
import { Role } from 'packages/sdk/dist/types';
import React from 'react';
import * as yup from 'yup';
import { RolesSelect, rolesSchema } from '../utils/Roles';
import { FormikStateSelect, yupStateSchema } from '../utils/States';

export const userFragment = graphql(/* GraphQL */ `
  fragment EditRolesActionUserFragment on User {
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

const UpdateProviderProfileAndSetUserRolesMutation = graphql(/* GraphQL */ `
  mutation UpdateProviderProfileAndSetUserRolesMutation(
    $providerId: ID!
    $updateProviderProfileInput: UpdateProviderProfileInput!
    $roles: [ID!]!
  ) {
    updateProviderProfile(providerId: $providerId, input: $updateProviderProfileInput)
    setUserRoles(userId: $providerId, roles: $roles)
  }
`);

const hasPrescriberRole = (roles: { value: string; label: string }[]) =>
  roles.some((r) => r.label === 'Prescriber');

const roleSchema = yup
  .object({
    first: yup.string().required(),
    last: yup.string().required(),
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
          .required('Please enter an address')
      })
      .notRequired()
      .default(undefined)
      .when('roles', (roles: { value: string; label: string }[], schema) => {
        return hasPrescriberRole(roles)
          ? schema.required(
              "Address, NPI and phone are required for users with 'Prescriber' permissions"
            )
          : schema.notRequired();
      }),
    phone: yup
      .string()
      .matches(/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/, {
        message: 'Please enter a valid phone number'
      })
      .required('Please enter a valid phone number')
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
  const [updateProviderProfileAndSetUserRolesMutation, { error, loading }] = useMutation(
    UpdateProviderProfileAndSetUserRolesMutation,
    {
      client: clinicalClient,
      refetchQueries: ['UsersListQuery']
    }
  );

  const handleSaveRoles = async (formVariables: RoleYupType) => {
    const maybeAddress: Partial<AddressInput> = {
      ...(formVariables.provider?.address ?? userData.address),
      state: formVariables.provider?.address.state.value ?? userData.address?.state
    };

    const address =
      maybeAddress.state &&
      maybeAddress.city &&
      maybeAddress.country &&
      maybeAddress.postalCode &&
      maybeAddress.street1
        ? (maybeAddress as AddressInput)
        : undefined;

    await Promise.all([
      updateProviderProfileAndSetUserRolesMutation({
        variables: {
          providerId: userData.id ?? '',
          updateProviderProfileInput: {
            name: {
              first: formVariables.first,
              last: formVariables.last
            },
            ...(address ? { address } : {}),
            email: formVariables.email ?? userData.email,
            npi: formVariables.provider?.npi ?? userData.npi,
            phone: formVariables.phone ?? userData.phone
          },
          roles: formVariables.roles.map((role: any) => role.value)
        }
      })
    ]);
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
    email: userData.email ?? '',
    roles: mapAndSortRoles(userData.roles ?? []),
    first: userData.name?.first ?? '',
    last: userData.name?.last ?? '',
    provider: {
      npi: userData.npi ?? '',
      address: {
        street1: userData.address?.street1 ?? '',
        street2: userData.address?.street2 ?? undefined,
        city: userData.address?.city ?? '',
        state: { value: (userData.address?.state as string) ?? '' },
        postalCode: userData.address?.postalCode ?? ''
      }
    },
    phone: userData.phone ?? ''
  };

  return (
    <ModalContent>
      <ModalHeader>
        <VStack spacing={3} align="stretch">
          <Text fontSize="bg">Edit user</Text>
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
              {userData.name?.full}
            </Text>
            <Text fontSize="sm">{userData.email}</Text>
          </VStack>
        </Box>
        {userData && (
          <Formik
            validateOnBlur
            validateOnChange
            initialValues={initialValues}
            validationSchema={roleSchema}
            onSubmit={async (values, { validateForm, resetForm }) => {
              await validateForm(values);
              await handleSaveRoles(values);
              toast({
                position: 'top-right',
                duration: 4000,
                render: ({ onClose }) => (
                  <StyledToast onClose={onClose} type="success" description="Profile Updated" />
                )
              });
              resetForm();
              onClose();
            }}
          >
            {({ setFieldValue, handleSubmit, errors, touched, values, setFieldTouched }) => {
              const hasPrescriber = hasPrescriberRole(values.roles);
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
                    <HStack>
                      <FormControl
                        isRequired
                        isInvalid={!!errors?.first && !!touched?.first}
                        pb="4"
                      >
                        <FormLabel htmlFor="first" mb={1}>
                          First name
                        </FormLabel>

                        <Field name="first" default={userData.name?.first} as={Input} />
                        <ErrorMessage name="first" component={FormErrorMessage} />
                      </FormControl>
                      <FormControl isRequired isInvalid={!!errors?.last && !!touched?.last} pb="4">
                        <FormLabel htmlFor="last" mb={1}>
                          Last name
                        </FormLabel>

                        <Field name="last" default={userData.name?.last} as={Input} />
                        <ErrorMessage name="last" component={FormErrorMessage} />
                      </FormControl>
                    </HStack>

                    {hasPrescriber && (
                      <>
                        <FormControl
                          isRequired={hasPrescriber}
                          isInvalid={!!providerErrors?.npi && !!providerTouched?.npi}
                          pb="4"
                        >
                          <FormLabel htmlFor="npi" mb={1}>
                            NPI
                          </FormLabel>

                          <Field name="provider.npi" default={userData.npi} as={Input} />
                          <ErrorMessage name="provider.npi" component={FormErrorMessage} />
                        </FormControl>
                        <FormControl
                          isRequired={hasPrescriber}
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
                            default={userData.address?.street1}
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
                            default={userData.address?.street2}
                            as={Input}
                          />
                          <ErrorMessage
                            name="provider.address.street2"
                            component={FormErrorMessage}
                          />
                        </FormControl>
                        <FormControl
                          isRequired={hasPrescriber}
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
                            default={userData.address?.city}
                            as={Input}
                          />
                          <ErrorMessage name="provider.address.city" component={FormErrorMessage} />
                        </FormControl>
                        <FormControl
                          isRequired={hasPrescriber}
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
                            fieldName="address.state"
                          />
                          <ErrorMessage
                            name="provider.address.state"
                            component={FormErrorMessage}
                          />
                        </FormControl>
                        <FormControl
                          isRequired={hasPrescriber}
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
                            default={userData.address?.postalCode}
                            as={Input}
                          />
                          <ErrorMessage
                            name="provider.address.postalCode"
                            component={FormErrorMessage}
                          />
                        </FormControl>
                        <ErrorMessage name="provider.address" component={FormErrorMessage} />

                        <FormControl
                          isRequired={hasPrescriber}
                          isInvalid={!!errors.phone && touched.phone}
                          pb="4"
                        >
                          <FormLabel htmlFor="phone" mb={1}>
                            Phone
                          </FormLabel>
                          <Field name="phone" default={userData.phone} as={Input} />
                          <ErrorMessage name="phone" component={FormErrorMessage} />
                        </FormControl>
                      </>
                    )}
                  </VStack>
                  <ModalFooter px="0">
                    <VStack>
                      <HStack>
                        <Button variant="outline" onClick={onClose} isDisabled={loading}>
                          Cancel
                        </Button>

                        <Button
                          type="submit"
                          colorScheme="blue"
                          isDisabled={
                            !touched ||
                            !!errors.roles ||
                            !!errors.email ||
                            !!errors.first ||
                            !!errors.last ||
                            !!errors.phone ||
                            !!(errors.provider && hasPrescriberRole(values.roles)) ||
                            !touched.roles
                          }
                          isLoading={loading}
                        >
                          Update
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
