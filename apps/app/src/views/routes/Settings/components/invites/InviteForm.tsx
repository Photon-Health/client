import { useMutation, useQuery } from '@apollo/client';
import {
  Alert,
  AlertIcon,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  VStack
} from '@chakra-ui/react';
import { graphql } from 'apps/app/src/gql';
import { InvitesQueryDocument } from 'apps/app/src/gql/graphql';
import { ErrorMessage, Field, Formik, FormikErrors, FormikTouched } from 'formik';
import * as yup from 'yup';
import { useClinicalApiClient } from '../../../../../clinicalApollo';
import { RolesSelect, rolesSchema } from '../utils/Roles';
import { FormikStateSelect, yupStateSchema } from '../utils/States';

export const inviteFormFragment = graphql(/* GraphQL */ `
  fragment InviteFormFragment on Invite {
    id
    invitee
    inviter
    expires_at
  }
`);

export const userInviteFormQuery = graphql(/* GraphQL */ `
  query UserInviteFormQuery {
    me {
      id
      name {
        full
      }
    }
  }
`);

const inviteUserMutation = graphql(/* GraphQL */ `
  mutation InviteUser(
    $email: String!
    $inviter: String
    $roles: [String!]!
    $provider: ProviderInput
  ) {
    inviteUser(email: $email, inviter: $inviter, roles: $roles, provider: $provider) {
      id
    }
  }
`);

const hasPrescriberRole = (roles: { value: string; label: string }[]) =>
  roles.some((r) => r.label === 'Prescriber');

const inviteSchema = yup
  .object({
    email: yup
      .string()
      .email('Invalid email')
      .required("Please include email of the person you'd like to invite"),
    roles: rolesSchema.required().min(1, 'Must have at least one role'),
    provider: yup
      .object({
        npi: yup
          .string()
          .required('NPI is required for prescribers')
          .matches(/^[0-9]*$/, { message: 'Invalid NPI' }),
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

type InviteYupType = yup.InferType<typeof inviteSchema>;
type ProviderYupType = InviteYupType['provider'];
type ProviderFormikTouchedType = FormikTouched<ProviderYupType>;
type ProviderFormikErrorsType = FormikErrors<ProviderYupType>;

export const InviteForm = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const client = useClinicalApiClient();
  const { data: user, loading: userLoading } = useQuery(userInviteFormQuery, {
    client,
    fetchPolicy: 'cache-first'
  });

  const [inviteUser, { error, loading }] = useMutation(inviteUserMutation, {
    client,
    refetchQueries: [InvitesQueryDocument]
  });

  const initialValues: yup.InferType<typeof inviteSchema> = {
    email: '',
    roles: [],
    provider: undefined
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Invite User</ModalHeader>
        <ModalBody>
          {error && (
            <Alert status="error">
              <AlertIcon />
              {error.message}
            </Alert>
          )}
          <Formik
            validateOnBlur
            initialValues={initialValues}
            validationSchema={inviteSchema}
            onSubmit={async (values, { validateForm, resetForm }) => {
              await validateForm(values);
              await inviteUser({
                variables: {
                  email: values.email,
                  roles: values.roles.map(({ value }) => value) ?? [],
                  inviter: user?.me.name?.full,
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
              resetForm();
              onClose();
            }}
          >
            {({ setFieldValue, handleSubmit, errors, touched, values, setFieldTouched }) => {
              // Typescript thinks that errors.provider and touched.provider are simple strings/bools
              // but really theyre objects
              const providerErrors = errors.provider as ProviderFormikErrorsType | undefined;
              const providerTouched = touched.provider as ProviderFormikTouchedType | undefined;
              return (
                <form onSubmit={handleSubmit} noValidate>
                  <VStack spacing={2} align="stretch">
                    <FormControl isInvalid={!!errors.roles && !!touched.roles} pb="4" isRequired>
                      <FormLabel htmlFor="roles" mb={1}>
                        Roles
                      </FormLabel>
                      <RolesSelect
                        onChange={(newValue) => setFieldValue('roles', newValue)}
                        onBlur={() => setFieldTouched('roles')}
                        value={values.roles}
                      />
                      <ErrorMessage name="roles" component={FormErrorMessage} />
                    </FormControl>
                    <FormControl isInvalid={!!errors.email && touched.email} pb="4" isRequired>
                      <FormLabel htmlFor="email" mb={1}>
                        Email
                      </FormLabel>
                      <Field name="email" as={Input} />
                      <ErrorMessage name="email" component={FormErrorMessage} />
                    </FormControl>
                    {hasPrescriberRole(values.roles) && (
                      <>
                        <FormControl
                          isRequired
                          isInvalid={!!providerErrors?.npi && providerTouched?.npi}
                          pb="4"
                        >
                          <FormLabel htmlFor="provider.npi" mb={1}>
                            NPI
                          </FormLabel>
                          <Field name="provider.npi" as={Input} />
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
                          <Field name="provider.address.street1" as={Input} />
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
                          <Field name="provider.address.street2" as={Input} />
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
                          <Field name="provider.address.city" as={Input} />
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
                            State
                          </FormLabel>
                          <FormikStateSelect
                            value={values.provider?.address?.state}
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
                          <Field name="provider.address.postalCode" as={Input} />
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
                          <Field name="provider.phone" as={Input} />
                          <ErrorMessage name="provider.phone" component={FormErrorMessage} />
                        </FormControl>
                      </>
                    )}
                  </VStack>
                  <ModalFooter px="0">
                    <VStack>
                      <HStack>
                        <Button variant="outline" mr={3} onClick={onClose}>
                          Close
                        </Button>
                        <Button
                          type="submit"
                          colorScheme="blue"
                          isDisabled={
                            loading ||
                            !!userLoading ||
                            !!errors.roles ||
                            !!errors.email ||
                            !!(errors.provider && hasPrescriberRole(values.roles)) ||
                            !touched.roles
                          }
                        >
                          Send invitation
                        </Button>
                      </HStack>
                    </VStack>
                  </ModalFooter>
                </form>
              );
            }}
          </Formik>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
