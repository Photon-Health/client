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
import { ErrorMessage, Field, Formik, validateYupSchema, yupToFormErrors } from 'formik';
import * as yup from 'yup';
import { usePhoton } from '@photonhealth/react';
import { RolesSelect, hasPrescriberRole, rolesSchema } from '../utils/Roles';
import { FormikStateSelect, yupStateSchema } from '../utils/States';
import { phoneRegex, zipCodeRegex } from '../utils/Validation';
import { AddressInput } from 'packages/sdk/dist/types';

const organizationSettingsQuery = graphql(/* GraphQL */ `
  query FaxPreferenceQuery {
    organization {
      settings {
        contact {
          rxPdf {
            fromFaxPreference
          }
        }
      }
    }
  }
`);

const inviteUserMutation = graphql(/* GraphQL */ `
  mutation InviteUser($email: String!, $roles: [String!]!, $provider: ProviderInput) {
    inviteUser(email: $email, roles: $roles, provider: $provider) {
      id
    }
  }
`);

const requiredForPrescribers =
  (message: string) => (roles: { value: string; label: string }[], schema: yup.BaseSchema) => {
    return hasPrescriberRole(roles) ? schema.required(message) : schema.notRequired();
  };

const inviteSchema = yup
  .object({
    email: yup.string().email('Enter a valid email').required('Email is required'),
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
      .when('roles', requiredForPrescribers('Phone number is required for prescribers')),
    fax: yup
      .string()
      .matches(phoneRegex, {
        message: 'Enter a valid fax number'
      })
      .test({
        message: 'Fax number is required for prescribers',
        test: (value, context) => {
          const isPrescriber = hasPrescriberRole(context.parent.roles);
          const providerFaxPreferred = context.options.context?.providerFaxPreferred;
          return isPrescriber && providerFaxPreferred ? !!value : true;
        }
      }),
    street1: yup.string().when('roles', requiredForPrescribers('Address is required')),
    street2: yup.string(),
    city: yup.string().when('roles', requiredForPrescribers('City is required')),
    state: yup.object({
      value: yupStateSchema.test({
        message: 'State is required',
        test: (value, context: any) => {
          // Wish there was a more intuitive way to access roles value
          const isPrescriber = hasPrescriberRole(context.from[1]?.value.roles);
          return isPrescriber ? !!value : true;
        }
      })
    }),
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
      state: undefined,
      postalCode: undefined
    };
    return { ...value, ...blankValues };
  });

type InviteYupType = yup.InferType<typeof inviteSchema>;

export const InviteForm = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { clinicalClient } = usePhoton();

  const { data, loading: loadingFaxPreference } = useQuery(organizationSettingsQuery, {
    client: clinicalClient
  });
  const providerFaxPreferred =
    data?.organization?.settings?.contact?.rxPdf?.fromFaxPreference === 'provider';

  const [inviteUser, { error, loading }] = useMutation(inviteUserMutation, {
    client: clinicalClient,
    refetchQueries: [InvitesQueryDocument]
  });

  const initialValues: yup.InferType<typeof inviteSchema> = {
    email: '',
    roles: [],
    npi: '',
    phone: '',
    fax: '',
    street1: '',
    street2: '',
    city: '',
    state: { value: '' },
    postalCode: ''
  };

  const handleSubmit = (values: InviteYupType) => {
    const address: AddressInput = {
      country: 'US',
      street1: values.street1 || '',
      street2: values.street2,
      city: values.city || '',
      postalCode: values.postalCode || '',
      state: values.state.value || ''
    };

    return inviteUser({
      variables: {
        email: values.email,
        roles: values.roles.map(({ value }) => value) ?? [],
        ...(hasPrescriberRole(values.roles)
          ? {
              provider: {
                address: address,
                npi: values.npi ?? '',
                phone: values.phone ?? '',
                fax: values.fax
              }
            }
          : {})
      }
    });
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
            initialValues={initialValues}
            validate={(value) => {
              try {
                validateYupSchema(value, inviteSchema, true, { providerFaxPreferred });
              } catch (err) {
                return yupToFormErrors(err);
              }
              return {};
            }}
            onSubmit={async (values, { validateForm, resetForm }) => {
              await validateForm(values);
              await handleSubmit(values);
              resetForm();
              onClose();
            }}
          >
            {({
              setFieldValue,
              handleSubmit,
              errors,
              touched,
              values,
              setFieldTouched,
              isValid
            }) => {
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
                        <FormControl isRequired isInvalid={!!errors?.npi && touched?.npi} pb="4">
                          <FormLabel htmlFor="npi" mb={1}>
                            NPI
                          </FormLabel>
                          <Field name="npi" as={Input} />
                          <ErrorMessage name="npi" component={FormErrorMessage} />
                        </FormControl>
                        <FormControl
                          isRequired
                          isInvalid={!!errors?.phone && touched?.phone}
                          pb="4"
                        >
                          <FormLabel htmlFor="phone" mb={1}>
                            Phone
                          </FormLabel>
                          <Field name="phone" as={Input} />
                          <ErrorMessage name="phone" component={FormErrorMessage} />
                        </FormControl>
                        <FormControl
                          isRequired={providerFaxPreferred}
                          isInvalid={!!errors?.fax && touched?.fax}
                          pb="4"
                        >
                          <FormLabel htmlFor="fax" mb={1}>
                            Fax
                          </FormLabel>
                          <Field name="fax" as={Input} />
                          <ErrorMessage name="fax" component={FormErrorMessage} />
                        </FormControl>
                        <FormControl
                          isRequired
                          isInvalid={!!errors?.street1 && touched?.street1}
                          pb="4"
                        >
                          <FormLabel htmlFor="street1" mb={1}>
                            Address 1
                          </FormLabel>
                          <Field name="street1" as={Input} />
                          <ErrorMessage name="street1" component={FormErrorMessage} />
                        </FormControl>
                        <FormControl isInvalid={!!errors?.street2 && touched?.street2} pb="4">
                          <FormLabel htmlFor="street2" mb={1}>
                            Address 2
                          </FormLabel>
                          <Field name="street2" as={Input} />
                          <ErrorMessage name="street2" component={FormErrorMessage} />
                        </FormControl>
                        <FormControl isRequired isInvalid={!!errors?.city && touched?.city} pb="4">
                          <FormLabel htmlFor="city" mb={1}>
                            City
                          </FormLabel>
                          <Field name="city" as={Input} />
                          <ErrorMessage name="city" component={FormErrorMessage} />
                        </FormControl>
                        <FormControl
                          isRequired
                          isInvalid={(!!errors?.state?.value && touched?.state?.value) ?? false}
                          pb="4"
                        >
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
                        <FormControl
                          isRequired
                          isInvalid={!!errors?.postalCode && touched?.postalCode}
                          pb="4"
                        >
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
                        <Button variant="outline" mr={3} onClick={onClose}>
                          Close
                        </Button>
                        <Button
                          type="submit"
                          colorScheme="blue"
                          isDisabled={loading || loadingFaxPreference || !isValid || !touched.roles}
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
