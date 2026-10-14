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
import { hasPrescriberRole, rolesSchema, RolesSelect } from '../utils/Roles';
import { FormikStateSelect, yupStateSchema } from '../utils/States';
import { npiRegex, phoneRegex, zipCodeRegex } from '../utils/Validation';
import { AddressInput } from 'packages/sdk/dist/types';
import { validateRealPhoneNumber } from 'apps/app/src/utils';
import { useFeatureFlag } from 'apps/app/src/hooks/useFeatureFlag';

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

type Role = { value: string; label: string };

/**
 * Validation context passed to the schema. `requirePrescriberDetails` is false
 * when the `allow_sparse_invites` flag is on and the inviter has chosen to let
 * the prescriber fill in their own details.
 */
type InviteValidationContext = {
  providerFaxPreferred: boolean;
  requirePrescriberDetails: boolean;
};

const requiredForPrescribers = (message: string) => ({
  is: (roles: Role[], requirePrescriberDetails: boolean) =>
    hasPrescriberRole(roles) && requirePrescriberDetails,
  then: (schema: yup.StringSchema) => schema.required(message),
  otherwise: (schema: yup.StringSchema) => schema.notRequired()
});

const PRESCRIBER_DETAIL_KEYS = ['roles', '$requirePrescriberDetails'];

const isValidUSPhone = (value?: string) => {
  if (!value) return true;
  return validateRealPhoneNumber(value);
};

const inviteSchema = yup
  .object({
    email: yup.string().email('Enter a valid email').required('Email is required'),
    roles: rolesSchema.required().min(1, 'Must have at least one role'),
    prefillPrescriberDetails: yup.boolean().required(),
    npi: yup
      .string()
      .matches(npiRegex, 'NPI must be a 10-digit number')
      .when(PRESCRIBER_DETAIL_KEYS, requiredForPrescribers('NPI is required')),
    phone: yup
      .string()
      .matches(phoneRegex, {
        message: 'Enter a valid phone number'
      })
      .test('is-valid-phone', 'Enter a valid phone number', isValidUSPhone)
      .when(
        PRESCRIBER_DETAIL_KEYS,
        requiredForPrescribers('Phone number is required for prescribers')
      ),
    fax: yup
      .string()
      .matches(phoneRegex, {
        message: 'Enter a valid fax number'
      })
      .test({
        message: 'Fax number is required for prescribers',
        test: (value, context) => {
          const isPrescriber = hasPrescriberRole(context.parent.roles);
          const { providerFaxPreferred, requirePrescriberDetails } =
            (context.options.context as InviteValidationContext | undefined) ?? {};
          return isPrescriber && providerFaxPreferred && requirePrescriberDetails ? !!value : true;
        }
      }),
    street1: yup
      .string()
      .when(PRESCRIBER_DETAIL_KEYS, requiredForPrescribers('Address is required')),
    street2: yup.string(),
    city: yup.string().when(PRESCRIBER_DETAIL_KEYS, requiredForPrescribers('City is required')),
    state: yup.object({
      value: yupStateSchema.test({
        message: 'State is required',
        test: (value, context: any) => {
          // Wish there was a more intuitive way to access roles value
          const isPrescriber = hasPrescriberRole(context.from[1]?.value.roles);
          const requirePrescriberDetails = (
            context.options.context as InviteValidationContext | undefined
          )?.requirePrescriberDetails;
          return isPrescriber && requirePrescriberDetails ? !!value : true;
        }
      })
    }),
    postalCode: yup
      .string()
      .matches(zipCodeRegex, { message: 'Enter a valid zip code' })
      .when(PRESCRIBER_DETAIL_KEYS, requiredForPrescribers('Zip code is required'))
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

const EMPTY_PRESCRIBER_DETAILS: Pick<
  InviteYupType,
  'npi' | 'phone' | 'fax' | 'street1' | 'street2' | 'city' | 'state' | 'postalCode'
> = {
  npi: '',
  phone: '',
  fax: '',
  street1: '',
  street2: '',
  city: '',
  state: { value: '' },
  postalCode: ''
};

export const InviteForm = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { clinicalClient } = usePhoton();
  const { enabled: sparseInvitesEnabled } = useFeatureFlag('allow_sparse_invites');

  const { data, loading: loadingFaxPreference } = useQuery(organizationSettingsQuery, {
    client: clinicalClient
  });
  const providerFaxPreferred =
    data?.organization?.settings?.contact?.rxPdf?.fromFaxPreference === 'provider';

  const [inviteUser, { error, loading }] = useMutation(inviteUserMutation, {
    client: clinicalClient,
    refetchQueries: [InvitesQueryDocument]
  });

  const initialValues: InviteYupType = {
    email: '',
    roles: [],
    prefillPrescriberDetails: false,
    ...EMPTY_PRESCRIBER_DETAILS
  };

  // With sparse invites, prescriber details are only collected when the
  // inviter opts in to prefilling them. Otherwise they're always required.
  const requiresPrescriberDetails = (values: InviteYupType) =>
    !sparseInvitesEnabled || values.prefillPrescriberDetails;

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
        ...(hasPrescriberRole(values.roles) && requiresPrescriberDetails(values)
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
                const context: InviteValidationContext = {
                  providerFaxPreferred,
                  requirePrescriberDetails: requiresPrescriberDetails(value)
                };
                validateYupSchema(value, inviteSchema, true, context);
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
              setValues,
              setTouched,
              handleSubmit,
              errors,
              touched,
              values,
              setFieldTouched,
              isValid
            }) => {
              const showPrescriberDetails =
                hasPrescriberRole(values.roles) && requiresPrescriberDetails(values);

              const clearPrescriberDetails = () => {
                setValues({
                  ...values,
                  ...EMPTY_PRESCRIBER_DETAILS,
                  prefillPrescriberDetails: false
                });
                setTouched({ roles: touched.roles, email: touched.email });
              };

              return (
                <form onSubmit={handleSubmit} noValidate>
                  <VStack spacing={2} align="stretch">
                    <FormControl isInvalid={!!errors.roles && !!touched.roles} pb="4" isRequired>
                      <FormLabel mb={1}>Roles</FormLabel>
                      <RolesSelect
                        onChange={(newValue) => setFieldValue('roles', newValue)}
                        onBlur={() => setFieldTouched('roles')}
                        value={values.roles}
                      />
                      <ErrorMessage name="roles" component={FormErrorMessage} />
                    </FormControl>
                    <FormControl isInvalid={!!errors.email && touched.email} pb="4" isRequired>
                      <FormLabel mb={1}>Email</FormLabel>
                      <Field name="email" as={Input} />
                      <ErrorMessage name="email" component={FormErrorMessage} />
                    </FormControl>
                    {sparseInvitesEnabled && hasPrescriberRole(values.roles) && (
                      <Button
                        variant="outline"
                        alignSelf="flex-start"
                        mb="4"
                        onClick={
                          values.prefillPrescriberDetails
                            ? clearPrescriberDetails
                            : () => setFieldValue('prefillPrescriberDetails', true)
                        }
                      >
                        {values.prefillPrescriberDetails
                          ? 'Let the user fill in their personal details themselves'
                          : 'Prefill Prescriber Data?'}
                      </Button>
                    )}
                    {showPrescriberDetails && (
                      <>
                        <FormControl isRequired isInvalid={!!errors?.npi && touched?.npi} pb="4">
                          <FormLabel mb={1}>NPI</FormLabel>
                          <Field name="npi" as={Input} />
                          <ErrorMessage name="npi" component={FormErrorMessage} />
                        </FormControl>
                        <FormControl
                          isRequired
                          isInvalid={!!errors?.phone && touched?.phone}
                          pb="4"
                        >
                          <FormLabel mb={1}>Phone</FormLabel>
                          <Field name="phone" as={Input} />
                          <ErrorMessage name="phone" component={FormErrorMessage} />
                        </FormControl>
                        <FormControl
                          isRequired={providerFaxPreferred}
                          isInvalid={!!errors?.fax && touched?.fax}
                          pb="4"
                        >
                          <FormLabel mb={1}>Fax</FormLabel>
                          <Field name="fax" as={Input} />
                          <ErrorMessage name="fax" component={FormErrorMessage} />
                        </FormControl>
                        <FormControl
                          isRequired
                          isInvalid={!!errors?.street1 && touched?.street1}
                          pb="4"
                        >
                          <FormLabel mb={1}>Address 1</FormLabel>
                          <Field name="street1" as={Input} />
                          <ErrorMessage name="street1" component={FormErrorMessage} />
                        </FormControl>
                        <FormControl isInvalid={!!errors?.street2 && touched?.street2} pb="4">
                          <FormLabel mb={1}>Address 2</FormLabel>
                          <Field name="street2" as={Input} />
                          <ErrorMessage name="street2" component={FormErrorMessage} />
                        </FormControl>
                        <FormControl isRequired isInvalid={!!errors?.city && touched?.city} pb="4">
                          <FormLabel mb={1}>City</FormLabel>
                          <Field name="city" as={Input} />
                          <ErrorMessage name="city" component={FormErrorMessage} />
                        </FormControl>
                        <FormControl
                          isRequired
                          isInvalid={(!!errors?.state?.value && touched?.state?.value) ?? false}
                          pb="4"
                        >
                          <FormLabel mb={1}>State</FormLabel>
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
                          <FormLabel mb={1}>Zip Code</FormLabel>
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
