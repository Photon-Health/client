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
import { ErrorMessage, Field, Formik, FormikHelpers } from 'formik';
import { useRef } from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import { AddressSuggestionList } from '../components/AddressSuggestionList';
import { StateSelect } from '../components/StateSelect';
import { useAddressAutocomplete } from '../components/useAddressAutocomplete';
import { SignupFormData, signupFormSchema } from './form';

interface SignupFormProps {
  initialFormData: SignupFormData;
  canPrefillNpi: boolean;
  supportEmail?: string;
  onSubmit: (values: SignupFormData) => Promise<void>;
}

export const SignupForm = ({
  initialFormData,
  canPrefillNpi,
  supportEmail,
  onSubmit
}: SignupFormProps) => {
  const setFieldValueRef = useRef<FormikHelpers<SignupFormData>['setFieldValue']>();
  const street1Ref = useRef<HTMLInputElement>(null);

  const { suggestions, fetchSuggestions, selectSuggestion, closeSuggestions, openSuggestions } =
    useAddressAutocomplete({
      onSelect: (address) => {
        const setFieldValue = setFieldValueRef.current;
        if (!setFieldValue) return;
        setFieldValue('street1', address.street1);
        setFieldValue('street2', address.street2);
        setFieldValue('city', address.city);
        setFieldValue('state', address.state);
        setFieldValue('postalCode', address.postalCode);
        street1Ref.current?.blur();
      }
    });

  return (
    <Container maxW="md" py={{ base: '6' }} bgColor="white">
      <Formik
        initialValues={initialFormData}
        validationSchema={signupFormSchema}
        onSubmit={onSubmit}
      >
        {({
          errors,
          touched,
          isSubmitting,
          handleSubmit,
          handleChange,
          handleBlur,
          values,
          setFieldValue
        }) => {
          setFieldValueRef.current = setFieldValue;
          return (
            <form onSubmit={handleSubmit}>
              <Stack spacing="8">
                <Stack spacing="4" textAlign="left">
                  <VStack alignItems="start">
                    <Heading as="h1" size="xs">
                      Confirm your info
                    </Heading>
                    <Text fontSize="md" color="gray">
                      This is a one-time setup. We'll securely save your details so prescribing is
                      faster next time.
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
                    <Box position="relative">
                      <Input
                        ref={street1Ref}
                        id="street1"
                        name="street1"
                        role="combobox"
                        placeholder="Enter your practice address"
                        aria-autocomplete="list"
                        aria-label="street1-arialabel"
                        aria-expanded={suggestions.length > 0}
                        data-1p-ignore
                        autoComplete="invalid-so-that-autofill-doesnt-popup-over-dropdown"
                        value={values.street1}
                        onChange={(e) => {
                          handleChange(e);
                          fetchSuggestions(e.target.value);
                        }}
                        onFocus={openSuggestions}
                        onBlur={(e) => {
                          handleBlur(e);
                          // Delay closing so a tap on a suggestion registers before the list unmounts
                          setTimeout(closeSuggestions, 200);
                        }}
                      />
                      <AddressSuggestionList
                        suggestions={suggestions}
                        onSelect={selectSuggestion}
                      />
                    </Box>
                    <ErrorMessage name="street1" component={FormErrorMessage} />
                  </FormControl>

                  <FormControl isInvalid={!!errors.street2 && touched.street2}>
                    <FormLabel htmlFor="street2">Street 2</FormLabel>
                    <Field
                      as={Input}
                      id="street2"
                      name="street2"
                      placeholder="Street 2 (optional)"
                      autoComplete="invalid-so-that-autofill-doesnt-popup-over-dropdown"
                    />
                    <ErrorMessage name="street2" component={FormErrorMessage} />
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.city && touched.city}>
                    <FormLabel htmlFor="city">City</FormLabel>
                    <Field
                      as={Input}
                      id="city"
                      name="city"
                      autoComplete="invalid-so-that-autofill-doesnt-popup-over-dropdown"
                    />
                    <ErrorMessage name="city" component={FormErrorMessage} />
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.state && touched.state}>
                    <FormLabel htmlFor="state">State</FormLabel>
                    <Field as={StateSelect} id="state" name="state" />
                    <ErrorMessage name="state" component={FormErrorMessage} />
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.postalCode && touched.postalCode}>
                    <FormLabel htmlFor="postalCode">ZIP Code</FormLabel>
                    <Field
                      as={Input}
                      id="postalCode"
                      name="postalCode"
                      autoComplete="invalid-so-that-autofill-doesnt-popup-over-dropdown"
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
          );
        }}
      </Formik>
    </Container>
  );
};
