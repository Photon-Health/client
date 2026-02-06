import {
  Alert,
  AlertDescription,
  AlertIcon,
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
import { useEffect, useMemo } from 'react';

const VALID_LICENSES = new Set(['MD', 'DO', 'PA', 'NP']);

export const SelfSignupPage = () => {
  const [searchParams] = useSearchParams();

  const state = searchParams.get('state') ?? undefined;
  const sessionToken = searchParams.get('session_token') ?? undefined;

  if (!state) {
    return <div>Error: no state</div>;
  }

  const { firstName, lastName, email, npi, phone, verified, credentials, supportEmail } = useMemo(
    () => extractTokenData(sessionToken),
    [sessionToken]
  );
  const canPrefillNpi = !!(npi && npi?.length === 10);
  const isVerifiedPrescriber = verified && VALID_LICENSES.has(credentials ?? 'none');

  const initialFormData: SignupFormData = {
    firstName: firstName || '',
    lastName: lastName || '',
    email: email || '',
    npi: npi || '',
    phone: phone || '',
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
    const hasPrefilledName = !!(firstName && lastName);
    trackSelfSignupEvent(
      'Self Signup Page Viewed',
      {
        credentials,
        isExternallyVerified: verified,
        hasPrefilledNpi: canPrefillNpi,
        hasPrefilledEmail: !!email,
        hasPrefilledName,
        fullName: hasPrefilledName ? `${firstName} ${lastName}` : undefined
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
      {isVerifiedPrescriber ? (
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
                      <Heading as="h1" size="xs">
                        Confirm your info
                      </Heading>
                      <Text fontSize="md" color="gray">
                        This is a one-time setup. We’ll securely save your details so prescribing is
                        faster next time.
                      </Text>
                      <Text fontSize="md" marginTop="4">
                        Please confirm your details:
                      </Text>
                    </VStack>

                    <Stack>
                      <FormControl isRequired isInvalid={!!errors.firstName && touched.firstName}>
                        <FormLabel htmlFor="firstName">First Name</FormLabel>
                        <Field
                          as={Input}
                          id="firstName"
                          name="firstName"
                          autoComplete="given-name"
                        />
                        <ErrorMessage name="firstName" component={FormErrorMessage} />
                      </FormControl>

                      <FormControl isRequired isInvalid={!!errors.lastName && touched.lastName}>
                        <FormLabel htmlFor="lastName">Last Name</FormLabel>
                        <Field
                          as={Input}
                          id="lastName"
                          name="lastName"
                          autoComplete="family-name"
                        />
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
                                  Photon will use this email to contact you if issues arise with
                                  your prescriptions.
                                </PopoverBody>
                              </PopoverContent>
                            </Portal>
                          </Popover>
                        </HStack>

                        <Field
                          as={Input}
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                        />
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
                              href={`mailto:${supportEmail}`}
                              textDecoration="underline"
                              _before={{ display: 'none' }}
                            >
                              {supportEmail}
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
                    </Stack>
                  </Stack>
                  <Stack spacing="4">
                    <Text fontSize="md">Practice Address</Text>

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

                    <FormControl
                      isRequired
                      isInvalid={!!errors.state?.value && touched.state?.value}
                    >
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
      ) : (
        <Container maxW="lg" marginY="8">
          <Alert status="error">
            <AlertIcon />
            <AlertDescription fontSize="sm">
              Your identity or prescribing credentials haven’t been verified, so you can’t access
              this page
            </AlertDescription>
          </Alert>
          {supportEmail && (
            <Text fontSize="sm" marginY="4" textAlign="center">
              <span>
                Please reach out to{' '}
                <Link
                  href={`mailto:${supportEmail}`}
                  textDecoration="underline"
                  _before={{ display: 'none' }}
                >
                  {supportEmail}
                </Link>{' '}
                if you believe this is an error or need help completing verification
              </span>
            </Text>
          )}
        </Container>
      )}
    </>
  );
};

type SelfSignupFormPrefillData = {
  firstName?: string;
  lastName?: string;
  email?: string;
  npi?: string;
  phone?: string;
  verified?: boolean;
  credentials?: string;
  supportEmail?: string;
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
  const phone: string | undefined = decodedPayload.phone
    ? formatPhoneToTenDigits(decodedPayload.phone)
    : undefined;

  const verified: boolean = decodedPayload.verified ?? false;
  const credentials: string | undefined = decodedPayload.credentials;
  const supportEmail: string | undefined = decodedPayload.supportEmail;

  if (!npi || !firstName || !lastName || !email || !phone) {
    const missingFields = [];
    if (!npi) missingFields.push('npi');
    if (!firstName) missingFields.push('firstName');
    if (!lastName) missingFields.push('lastName');
    if (!email) missingFields.push('email');
    if (!phone) missingFields.push('phone');
    // logging this so we can see occurrences in DataDog RUM
    console.warn(`Prefill data missing from token for ${email}: ${missingFields.join(', ')}`);
  }

  if (!verified || !VALID_LICENSES.has(credentials ?? 'none')) {
    console.error(`Non verified prescriber attempted to sign up`, decodedPayload);
  }

  return { firstName, lastName, email, npi, phone, verified, credentials, supportEmail };
}

function formatPhoneToTenDigits(phone: string | number): string {
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) {
    return digits.slice(1);
  }
  return digits;
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
    did_accept_tos: formData.didAgreeToTerms.toString(),
    // these version numbers must match an entry in the attestations table
    // otherwise an error will occur during signup
    tos_version: '1.0.0',
    baa_version: '1.0.0'
  });

  if (formData.street2) {
    params.set('street2', formData.street2);
  }

  return params.toString();
};

async function wait(number: number) {
  return new Promise((resolve) => setTimeout(resolve, number));
}
