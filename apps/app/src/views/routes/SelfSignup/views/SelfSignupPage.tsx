import {
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  Link,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Portal,
  Stack,
  Text,
  VStack
} from '@chakra-ui/react';
import { ErrorMessage, Field, Formik } from 'formik';
import { useSearchParams } from 'react-router-dom';
import { auth0Config } from '../../../../configs/auth';
import { trackSelfSignupEvent } from '../../../../configs/analytics';
import { Logo } from '../../../components/Logo';
import { FormikStateSelect } from '../../Settings/components/utils/States';
import { SignupFormData, signupFormSchema } from './form';
import { FaInfoCircle } from 'react-icons/fa';
import { useEffect } from 'react';

export const SelfSignupPage = () => {
  const [searchParams] = useSearchParams();

  const state = searchParams.get('state') ?? undefined;
  const sessionToken = searchParams.get('session_token') ?? undefined;

  if (!state) {
    return <div>Error: no state</div>;
  }

  const { firstName, lastName, email, npi } = extractTokenData(sessionToken);
  const canPrefillNpi = npi && npi?.length === 10;

  const initialFormData: SignupFormData = {
    firstName: firstName || '',
    lastName: lastName || '',
    email: email || '',
    npi: npi || '',
    phone: '',
    fax: '',
    street1: '',
    street2: '',
    city: '',
    state: { value: '' },
    postalCode: '',
    didAgreeToTerms: false
  };

  const submitForm = async (values: SignupFormData) => {
    // Track form submission
    await trackSelfSignupEvent(
      'Self Signup Page Submitted',
      {
        hasNpi: !!values.npi,
        hasPhone: !!values.phone,
        hasFax: !!values.fax,
        hasStreet2: !!values.street2,
        didAgreeToTerms: values.didAgreeToTerms
      },
      sessionToken
    );

    await wait(100);
    const queryParams = buildSignupContinueParams(state, values);
    window.location.href = `https://${auth0Config.domain}/continue?${queryParams}`;
  };

  // Track page view on mount
  useEffect(() => {
    trackSelfSignupEvent(
      'Self Signup Page Viewed',
      {
        hasPrefilledNpi: canPrefillNpi,
        hasPrefilledEmail: !!email,
        hasPrefilledName: !!(firstName && lastName),
        fullName: `${firstName} ${lastName}`
      },
      sessionToken
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only track once on mount - these values are derived from URL params and won't change

  return (
    <>
      <Box as="nav" bg="#001740" py="3">
        <Container>
          <Logo pr="4" />
        </Container>
      </Box>
      <Container maxW="md" py={{ base: '6' }} bgColor="white">
        <Formik
          initialValues={initialFormData}
          validationSchema={signupFormSchema}
          onSubmit={submitForm}
        >
          {({
            errors,
            touched,
            isSubmitting,
            handleSubmit,
            values,
            setFieldValue,
            setFieldTouched
          }) => (
            <form onSubmit={handleSubmit}>
              <Stack spacing="8">
                <Stack spacing="4" textAlign="left">
                  <VStack alignItems="start">
                    <Heading as="h1" size="sm">
                      Create Your Prescriber Account
                    </Heading>
                    <Text fontSize="md" color="gray">
                      Pharmacies may use this information to ensure safe and compliant prescription
                      fulfillment.
                    </Text>
                    <Text fontSize="md" marginTop="4">
                      Please confirm your details:
                    </Text>
                  </VStack>

                  <Stack>
                    <FormControl isRequired isInvalid={!!errors.firstName && touched.firstName}>
                      <FormLabel htmlFor="firstName">First Name</FormLabel>
                      <Field as={Input} id="firstName" name="firstName" autoComplete="given-name" />
                      <ErrorMessage name="firstName" component={FormErrorMessage} />
                    </FormControl>

                    <FormControl isRequired isInvalid={!!errors.lastName && touched.lastName}>
                      <FormLabel htmlFor="lastName">Last Name</FormLabel>
                      <Field as={Input} id="lastName" name="lastName" autoComplete="family-name" />
                      <ErrorMessage name="lastName" component={FormErrorMessage} />
                    </FormControl>

                    <FormControl isRequired isInvalid={!!errors.email && touched.email}>
                      <HStack spacing="0" alignItems="center">
                        <FormLabel htmlFor="email" marginRight="0" marginBottom="0">
                          Email
                        </FormLabel>
                        <Popover placement={'top-start'}>
                          <PopoverTrigger>
                            <IconButton
                              variant="ghost"
                              color="gray"
                              size="xs"
                              aria-label="Why is email required?"
                              icon={<FaInfoCircle />}
                            />
                          </PopoverTrigger>
                          <Portal>
                            <PopoverContent>
                              <PopoverBody>
                                Photon will use this email to contact you if issues arise with your
                                prescriptions.
                              </PopoverBody>
                            </PopoverContent>
                          </Portal>
                        </Popover>
                      </HStack>

                      <Field as={Input} id="email" name="email" type="email" autoComplete="email" />
                      <ErrorMessage name="email" component={FormErrorMessage} />
                    </FormControl>

                    <FormControl
                      isRequired={!canPrefillNpi}
                      isInvalid={!!errors.npi && touched.npi}
                    >
                      <FormLabel htmlFor="npi">NPI</FormLabel>
                      <Field
                        as={Input}
                        id="npi"
                        name="npi"
                        placeholder="Enter your 10-digit NPI"
                        maxLength={10}
                        isReadOnly={canPrefillNpi}
                      />
                      {canPrefillNpi ? (
                        <FormHelperText marginBottom="4">
                          If your NPI is incorrect, please contact{' '}
                          <Link
                            href="mailto:support@doximity.com"
                            textDecoration="underline"
                            _before={{ display: 'none' }}
                          >
                            support@doximity.com
                          </Link>
                          .
                        </FormHelperText>
                      ) : null}
                      <ErrorMessage name="npi" component={FormErrorMessage} />
                    </FormControl>

                    <FormControl isRequired isInvalid={!!errors.phone && touched.phone}>
                      <FormLabel htmlFor="phone">Phone</FormLabel>
                      <Field
                        as={Input}
                        id="phone"
                        name="phone"
                        placeholder="Enter your phone number"
                        maxLength={10}
                      />
                      <ErrorMessage name="phone" component={FormErrorMessage} />
                    </FormControl>

                    <FormControl isInvalid={!!errors.fax && touched.fax}>
                      <HStack spacing="0" alignItems="center">
                        <FormLabel htmlFor="fax" marginRight="0" marginBottom="0">
                          Fax
                        </FormLabel>
                        <Popover placement={'top-start'}>
                          <PopoverTrigger>
                            <IconButton
                              variant="ghost"
                              color="gray"
                              size="xs"
                              aria-label="Why provide my fax?"
                              icon={<FaInfoCircle />}
                            />
                          </PopoverTrigger>
                          <Portal>
                            <PopoverContent>
                              <PopoverBody>
                                Pharmacies may use this fax number to reach you if there are
                                questions or issues with your prescriptions.
                              </PopoverBody>
                            </PopoverContent>
                          </Portal>
                        </Popover>
                      </HStack>
                      <Field
                        as={Input}
                        id="fax"
                        name="fax"
                        placeholder="Enter your fax number (optional)"
                        maxLength={10}
                      />
                      <ErrorMessage name="fax" component={FormErrorMessage} />
                    </FormControl>
                  </Stack>
                </Stack>
                <Stack spacing="4">
                  <Text fontSize="md">Address</Text>

                  <FormControl isRequired isInvalid={!!errors.street1 && touched.street1}>
                    <FormLabel htmlFor="street1">Street 1</FormLabel>
                    <Field as={Input} id="street1" name="street1" autoComplete="address-line1" />
                    <ErrorMessage name="street1" component={FormErrorMessage} />
                  </FormControl>

                  <FormControl isInvalid={!!errors.street2 && touched.street2}>
                    <FormLabel htmlFor="street2">Street 2</FormLabel>
                    <Field
                      as={Input}
                      id="street2"
                      name="street2"
                      placeholder="Street 2 (optional)"
                      autoComplete="address-line2"
                    />
                    <ErrorMessage name="street2" component={FormErrorMessage} />
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.city && touched.city}>
                    <FormLabel htmlFor="city">City</FormLabel>
                    <Field as={Input} id="city" name="city" autoComplete="address-level2" />
                    <ErrorMessage name="city" component={FormErrorMessage} />
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.state?.value && touched.state?.value}>
                    <FormLabel htmlFor="state">State</FormLabel>
                    <FormikStateSelect
                      value={values.state}
                      setFieldValue={setFieldValue}
                      setFieldTouched={setFieldTouched}
                      fieldName="state"
                    />
                    <ErrorMessage name="state.value" component={FormErrorMessage} />
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.postalCode && touched.postalCode}>
                    <FormLabel htmlFor="postalCode">ZIP Code</FormLabel>
                    <Field
                      as={Input}
                      id="postalCode"
                      name="postalCode"
                      autoComplete="postal-code"
                    />
                    <ErrorMessage name="postalCode" component={FormErrorMessage} />
                  </FormControl>

                  <FormControl isInvalid={!!errors.didAgreeToTerms && touched.didAgreeToTerms}>
                    <Checkbox
                      isChecked={values.didAgreeToTerms}
                      alignItems={'baseline'}
                      onChange={(e) => setFieldValue('didAgreeToTerms', e.target.checked)}
                    >
                      <Text as="span" fontWeight="bold" fontSize="md" display="inline">
                        I agree
                      </Text>{' '}
                      <Text as="span" fontSize="md" display="inline">
                        that by creating an account and prescribing with Photon Health, Inc., I am
                        authorized and licensed to prescribe, and I accept Photon Health's{' '}
                        <Link href="https://www.photon.health/terms" target="_blank">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="https://www.photon.health/baa" target="_blank">
                          Business Associate Agreement (BAA)
                        </Link>
                        .
                      </Text>
                    </Checkbox>{' '}
                    <ErrorMessage name="didAgreeToTerms" component={FormErrorMessage} />
                  </FormControl>

                  <Button type="submit" isLoading={isSubmitting}>
                    Submit
                  </Button>
                </Stack>
              </Stack>
            </form>
          )}
        </Formik>
      </Container>
    </>
  );
};

type SelfSignupFormPrefillData = {
  firstName?: string;
  lastName?: string;
  email?: string;
  npi?: string;
};

function extractTokenData(tosSessionToken?: string): SelfSignupFormPrefillData {
  if (!tosSessionToken) {
    return {};
  }
  const [, payload] = tosSessionToken.split('.');
  const decodedPayload = JSON.parse(atob(payload));
  const firstName: string = decodedPayload.first_name;
  const lastName: string = decodedPayload.last_name;
  const email: string = decodedPayload.email;
  const npi: string | undefined = decodedPayload.npi ? String(decodedPayload.npi) : undefined;

  if (!npi || !firstName || !lastName || !email) {
    const missingFields = [];
    if (!npi) missingFields.push('npi');
    if (!firstName) missingFields.push('firstName');
    if (!lastName) missingFields.push('lastName');
    if (!email) missingFields.push('email');
    // logging this so we can see errors in DataDog RUM
    console.error(`Prefill data missing from token for ${email}: ${missingFields.join(', ')}`);
  }

  return { firstName, lastName, email, npi };
}

const buildSignupContinueParams = (state: string, formData: SignupFormData): string => {
  const params = new URLSearchParams({
    state,
    first_name: formData.firstName,
    last_name: formData.lastName,
    email: formData.email,
    npi: formData.npi,
    phone: formData.phone,
    street1: formData.street1,
    city: formData.city,
    state_address: formData.state.value,
    postal_code: formData.postalCode,
    did_accept_tos: formData.didAgreeToTerms.toString()
  });

  if (formData.street2) {
    params.set('street2', formData.street2);
  }

  if (formData.fax) {
    params.set('fax', formData.fax);
  }

  return params.toString();
};

async function wait(number: number) {
  return new Promise((resolve) => setTimeout(resolve, number));
}
