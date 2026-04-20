import { forwardRef, useImperativeHandle, useRef, useState, useCallback } from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  Input,
  Select,
  Text,
  VStack,
  HStack,
  Icon
} from '@chakra-ui/react';
import { FiMapPin } from 'react-icons/fi';
import { Formik, Form, Field, FieldProps, FormikProps } from 'formik';
import * as Yup from 'yup';
import { updatePatientAddress, updateOrderAddress } from '../api';
import { Order } from '../utils/models';
import { usePatientAnalytics } from '../hooks/usePatientAnalytics';

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'DC', label: 'District of Columbia' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' }
];

const addressValidationSchema = Yup.object().shape({
  street1: Yup.string().trim().required('Street address is required'),
  street2: Yup.string().trim(),
  city: Yup.string().trim().required('City is required'),
  state: Yup.string().required('State is required'),
  postalCode: Yup.string()
    .trim()
    .required('ZIP code is required')
    .matches(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code')
});

interface AddressFormValues {
  street1: string;
  street2: string;
  city: string;
  state: string;
  postalCode: string;
}

const initialValues: AddressFormValues = {
  street1: '',
  street2: '',
  city: '',
  state: '',
  postalCode: ''
};

interface AddressFormProps {
  patientId: string;
  orderId: string;
  order: Order;
}

export interface AddressFormHandle {
  submit: () => Promise<boolean>;
  isSubmitting: boolean;
}

export const AddressForm = forwardRef<AddressFormHandle, AddressFormProps>(
  ({ patientId, orderId, order }, ref) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const formikRef = useRef<FormikProps<AddressFormValues>>(null);
    const submitResultRef = useRef<boolean>(false);
    const patientAnalytics = usePatientAnalytics();

    const submitAddress = useCallback(
      async (values: AddressFormValues): Promise<boolean> => {
        setIsSubmitting(true);
        setSubmitError(null);
        submitResultRef.current = false;

        try {
          // Step 1: Update patient address
          const updatedPatient = await updatePatientAddress(patientId, {
            street1: values.street1.trim(),
            street2: values.street2.trim() || undefined,
            city: values.city.trim(),
            state: values.state,
            postalCode: values.postalCode.trim(),
            country: 'US'
          });

          patientAnalytics.track('Patient Address Updated', order, {
            city: values.city,
            state: values.state,
            postalCode: values.postalCode
          });

          // Step 2: Update order with the new address ID
          const addressId = updatedPatient?.address?.id;
          if (!addressId) {
            throw new Error('Address was saved but no ID was returned');
          }

          await updateOrderAddress(orderId, addressId);

          patientAnalytics.track('Order Address Updated', order, {
            addressId
          });

          submitResultRef.current = true;
          return true;
        } catch (e: any) {
          setSubmitError(e.message || 'Failed to update address. Please try again.');
          submitResultRef.current = false;
          return false;
        } finally {
          setIsSubmitting(false);
        }
      },
      [patientId, orderId, order]
    );

    // Expose submit method to parent via ref
    useImperativeHandle(
      ref,
      () => ({
        submit: async () => {
          if (!formikRef.current) return false;

          // Validate and touch all fields to show errors
          const errors = await formikRef.current.validateForm();
          formikRef.current.setTouched({
            street1: true,
            street2: true,
            city: true,
            state: true,
            postalCode: true
          });

          if (Object.keys(errors).length > 0) {
            return false;
          }

          // Submit the form
          const result = await submitAddress(formikRef.current.values);
          return result;
        },
        isSubmitting
      }),
      [isSubmitting, submitAddress]
    );

    return (
      <Box bgColor="white" borderRadius="lg" p={5}>
        <VStack spacing={5} align="stretch">
          <HStack spacing={3} align="start">
            <Box
              p={2}
              borderRadius="full"
              bgColor="yellow.100"
              color="yellow.700"
              flexShrink={0}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={FiMapPin} boxSize={5} />
            </Box>
            <VStack spacing={0} align="start">
              <Heading as="h3" size="md">
                Add your address
              </Heading>
              <Text fontSize="sm" color="gray.600">
                Required to find nearby pharmacies
              </Text>
            </VStack>
          </HStack>

          <Formik
            innerRef={formikRef}
            initialValues={initialValues}
            validationSchema={addressValidationSchema}
            onSubmit={submitAddress}
            validateOnBlur={true}
            validateOnChange={false}
          >
            {() => (
              <Form>
                <VStack spacing={4} align="stretch">
                  <Field name="street1">
                    {({ field, meta }: FieldProps) => (
                      <FormControl isInvalid={!!(meta.error && meta.touched)} isRequired>
                        <FormLabel htmlFor="street1" fontSize="sm">
                          Street address
                        </FormLabel>
                        <Input {...field} id="street1" className="mp-mask" />
                        <FormErrorMessage>{meta.error}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <Field name="street2">
                    {({ field }: FieldProps) => (
                      <FormControl>
                        <FormLabel htmlFor="street2" fontSize="sm">
                          Apartment, suite, etc. (optional)
                        </FormLabel>
                        <Input {...field} id="street2" className="mp-mask" />
                      </FormControl>
                    )}
                  </Field>

                  <Field name="city">
                    {({ field, meta }: FieldProps) => (
                      <FormControl isInvalid={!!(meta.error && meta.touched)} isRequired>
                        <FormLabel htmlFor="city" fontSize="sm">
                          City
                        </FormLabel>
                        <Input {...field} id="city" className="mp-mask" />
                        <FormErrorMessage>{meta.error}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <HStack spacing={4} align="start">
                    <Field name="state">
                      {({ field, meta }: FieldProps) => (
                        <FormControl isInvalid={!!(meta.error && meta.touched)} isRequired flex={1}>
                          <FormLabel htmlFor="state" fontSize="sm">
                            State
                          </FormLabel>
                          <Select
                            {...field}
                            id="state"
                            name="state"
                            title="State"
                            aria-label="State"
                            placeholder="Select state"
                          >
                            {US_STATES.map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            ))}
                          </Select>
                          <FormErrorMessage>{meta.error}</FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>

                    <Field name="postalCode">
                      {({ field, meta }: FieldProps) => (
                        <FormControl isInvalid={!!(meta.error && meta.touched)} isRequired flex={1}>
                          <FormLabel htmlFor="postalCode" fontSize="sm">
                            ZIP code
                          </FormLabel>
                          <Input {...field} id="postalCode" maxLength={10} className="mp-mask" />
                          <FormErrorMessage>{meta.error}</FormErrorMessage>
                        </FormControl>
                      )}
                    </Field>
                  </HStack>

                  {submitError && (
                    <Text color="red.500" fontSize="sm">
                      {submitError}
                    </Text>
                  )}
                </VStack>
              </Form>
            )}
          </Formik>
        </VStack>
      </Box>
    );
  }
);

AddressForm.displayName = 'AddressForm';
