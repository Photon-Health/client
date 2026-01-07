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
import { ErrorMessage, Field, Formik, validateYupSchema, yupToFormErrors } from 'formik';
import { Role } from 'packages/sdk/dist/types';
import React from 'react';
import * as yup from 'yup';
import { RolesSelect, hasPrescriberRole, rolesSchema } from '../utils/Roles';
import { FormikStateSelect, yupStateSchema } from '../utils/States';
import { phoneRegex, zipCodeRegex } from '../utils/Validation';

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

const requiredForPrescribers =
  (message: string) => (roles: { value: string; label: string }[], schema: yup.BaseSchema) => {
    return hasPrescriberRole(roles) ? schema.required(message) : schema.notRequired();
  };

const roleSchema = yup
  .object({
    first: yup.string().required('First name is required'),
    last: yup.string().required('Last name is required'),
    roles: rolesSchema.required().min(1, 'Must have at least one role'),
    npi: yup
      .string()
      .matches(/^[0-9]+$/, { message: 'Enter a valid NPI' })
      .when('roles', requiredForPrescribers('NPI is required')),
    phone: yup
      .string()
      .matches(phoneRegex, {
        message: 'Enter a valid phone number'
      })
      .test({
        message: 'Prescriber phone cannot be removed',
        test: (value, context) => {
          if (!hasPrescriberRole(context.parent.roles)) {
            return true;
          }
          if (context.options.context?.initialValues.phone) {
            return !!value;
          }
          return true;
        }
      }),
    fax: yup
      .string()
      .matches(phoneRegex, {
        message: 'Enter a valid fax number'
      })
      .test({
        message: 'Prescriber fax cannot be removed',
        test: (value, context) => {
          if (!hasPrescriberRole(context.parent.roles)) {
            return true;
          }
          if (context.options.context?.initialValues.fax) {
            return !!value;
          }
          return true;
        }
      }),
    street1: yup.string().when('roles', requiredForPrescribers('Address is required')),
    street2: yup.string(),
    city: yup.string().when('roles', requiredForPrescribers('City is required')),
    state: yupStateSchema,
    postalCode: yup
      .string()
      .matches(zipCodeRegex, { message: 'Enter a valid zip code' })
      .when('roles', requiredForPrescribers('Zip code is required'))
  })
  // If not a prescriber, don't validate values required for prescriber
  .transform((value) => {
    if (hasPrescriberRole(value.roles)) {
      return value;
    }
    const blankValues = {
      npi: undefined,
      phone: undefined,
      fax: undefined,
      street1: undefined,
      street2: undefined,
      city: undefined,
      postalCode: undefined
      // Not including state for now since
      // `yupStateSchema` makes it difficult to skip validation
    };
    return { ...value, ...blankValues };
  });

type RoleYupType = yup.InferType<typeof roleSchema>;

function mapAndSortRoles(roles: Role[]): { value: string; label: string; description?: string }[] {
  const mappedRoles = roles.map(({ name, id, description }) => ({
    value: id,
    label: name ?? id,
    description: description ?? undefined
  }));
  const sortedRoles = mappedRoles.sort();
  return sortedRoles;
}

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
      country: 'US',
      street1: formVariables.street1,
      street2: formVariables.street2,
      city: formVariables.city,
      postalCode: formVariables.postalCode,
      state: formVariables.state.value
    };

    const address =
      maybeAddress.state && maybeAddress.city && maybeAddress.postalCode && maybeAddress.street1
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
            ...(hasPrescriberRole(formVariables.roles)
              ? {
                  address,
                  npi: formVariables.npi,
                  phone: formVariables.phone,
                  fax: formVariables.fax
                }
              : // Otherwise, these fields aren't present in the form
                // so user doesn't intend to update them
                {})
          },
          roles: formVariables.roles.map((role: any) => role.value)
        }
      })
    ]);
  };

  const initialValues: yup.InferType<typeof roleSchema> = {
    roles: mapAndSortRoles(userData.roles ?? []),
    first: userData.name?.first ?? '',
    last: userData.name?.last ?? '',
    npi: userData.npi ?? '',
    street1: userData.address?.street1 ?? '',
    street2: userData.address?.street2 ?? undefined,
    city: userData.address?.city ?? '',
    state: { value: (userData.address?.state as string) ?? '' },
    postalCode: userData.address?.postalCode ?? '',
    phone: userData.phone ?? '',
    fax: userData.fax ?? ''
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
            <Text fontSize="sm">{userData.id}</Text>
          </VStack>
        </Box>
        {userData && (
          <Formik
            initialValues={initialValues}
            validate={(value) => {
              try {
                validateYupSchema(value, roleSchema, true, { initialValues });
              } catch (err) {
                return yupToFormErrors(err);
              }
              return {};
            }}
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
            {({ setFieldValue, handleSubmit, errors, values, setFieldTouched, isValid }) => {
              const hasPrescriber = hasPrescriberRole(values.roles);
              return (
                <form onSubmit={handleSubmit} noValidate>
                  <VStack spacing={2} align="stretch">
                    <FormControl isInvalid={!!errors.roles} pb="4" isRequired>
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
                    <FormControl isRequired isInvalid={!!errors?.first} pb="4">
                      <FormLabel htmlFor="first" mb={1}>
                        First Name
                      </FormLabel>
                      <Field name="first" as={Input} />
                      <ErrorMessage name="first" component={FormErrorMessage} />
                    </FormControl>
                    <FormControl isRequired isInvalid={!!errors?.last} pb="4">
                      <FormLabel htmlFor="last" mb={1}>
                        Last Name
                      </FormLabel>
                      <Field name="last" as={Input} />
                      <ErrorMessage name="last" component={FormErrorMessage} />
                    </FormControl>
                    {hasPrescriber && (
                      <>
                        <FormControl isRequired isInvalid={!!errors?.npi} pb="4">
                          <FormLabel htmlFor="npi" mb={1}>
                            NPI
                          </FormLabel>
                          <Field name="npi" as={Input} />
                          <ErrorMessage name="npi" component={FormErrorMessage} />
                        </FormControl>
                        <FormControl isRequired isInvalid={!!errors.phone} pb="4">
                          <FormLabel htmlFor="phone" mb={1}>
                            Phone
                          </FormLabel>
                          <Field name="phone" as={Input} />
                          <ErrorMessage name="phone" component={FormErrorMessage} />
                        </FormControl>
                        <FormControl isRequired isInvalid={!!errors.fax} pb="4">
                          <FormLabel htmlFor="fax" mb={1}>
                            Fax
                          </FormLabel>
                          <Field name="fax" as={Input} />
                          <ErrorMessage name="fax" component={FormErrorMessage} />
                        </FormControl>
                        <FormControl isRequired isInvalid={!!errors?.street1} pb="4">
                          <FormLabel htmlFor="street1" mb={1}>
                            Address 1
                          </FormLabel>
                          <Field name="street1" as={Input} />
                          <ErrorMessage name="street1" component={FormErrorMessage} />
                        </FormControl>
                        <FormControl isInvalid={!!errors?.street2} pb="4">
                          <FormLabel htmlFor="street2" mb={1}>
                            Address 2
                          </FormLabel>
                          <Field name="street2" as={Input} />
                          <ErrorMessage name="street2" component={FormErrorMessage} />
                        </FormControl>
                        <FormControl isRequired isInvalid={!!errors?.city} pb="4">
                          <FormLabel htmlFor="city" mb={1}>
                            City
                          </FormLabel>
                          <Field name="city" as={Input} />
                          <ErrorMessage name="city" component={FormErrorMessage} />
                        </FormControl>
                        <FormControl isRequired isInvalid={!!errors?.state?.value} pb="4">
                          <FormLabel htmlFor="state" mb={1}>
                            State
                          </FormLabel>
                          <FormikStateSelect
                            value={values.state?.value ? { value: values.state?.value } : undefined}
                            setFieldTouched={setFieldTouched}
                            setFieldValue={setFieldValue}
                            fieldName="state"
                          />
                          <ErrorMessage name="state" component={FormErrorMessage} />
                        </FormControl>
                        <FormControl isRequired isInvalid={!!errors?.postalCode} pb="4">
                          <FormLabel htmlFor="postalCode" mb={1}>
                            Zip Code
                          </FormLabel>
                          <Field name="postalCode" as={Input} />
                          <ErrorMessage name="postalCode" component={FormErrorMessage} />
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
                          isDisabled={!isValid}
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
