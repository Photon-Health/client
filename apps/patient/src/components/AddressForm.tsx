import { forwardRef, useImperativeHandle, useState } from 'react';
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
import { updatePatientAddress, updateOrderAddress } from '../api';
import { patientAnalytics } from '../configs/analytics';
import { Order } from '../utils/models';

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

interface AddressFormProps {
  patientId: string;
  orderId: string;
  order: Order;
}

interface FormErrors {
  street1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export interface AddressFormHandle {
  submit: () => Promise<boolean>;
  isSubmitting: boolean;
}

export const AddressForm = forwardRef<AddressFormHandle, AddressFormProps>(
  ({ patientId, orderId, order }, ref) => {
    const [street1, setStreet1] = useState('');
    const [street2, setStreet2] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitError, setSubmitError] = useState<string | null>(null);

    const validateForm = (): boolean => {
      const newErrors: FormErrors = {};

      if (!street1.trim()) {
        newErrors.street1 = 'Street address is required';
      }

      if (!city.trim()) {
        newErrors.city = 'City is required';
      }

      if (!state) {
        newErrors.state = 'State is required';
      }

      if (!postalCode.trim()) {
        newErrors.postalCode = 'ZIP code is required';
      } else if (!/^\d{5}(-\d{4})?$/.test(postalCode.trim())) {
        newErrors.postalCode = 'Please enter a valid ZIP code';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (): Promise<boolean> => {
      if (!validateForm()) {
        return false;
      }

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        // Step 1: Update patient address
        const updatedPatient = await updatePatientAddress(patientId, {
          street1: street1.trim(),
          street2: street2.trim() || undefined,
          city: city.trim(),
          state,
          postalCode: postalCode.trim(),
          country: 'US'
        });

        patientAnalytics.track('Patient Address Updated', order, {
          city,
          state,
          postalCode
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

        return true;
      } catch (e: any) {
        setSubmitError(e.message || 'Failed to update address. Please try again.');
        return false;
      } finally {
        setIsSubmitting(false);
      }
    };

    // Expose submit method to parent
    useImperativeHandle(ref, () => ({
      submit: handleSubmit,
      isSubmitting
    }));

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

          <VStack spacing={4} align="stretch">
            <FormControl isInvalid={!!errors.street1} isRequired>
              <FormLabel htmlFor="street1" fontSize="sm">
                Street address
              </FormLabel>
              <Input
                id="street1"
                placeholder="123 Main St"
                value={street1}
                onChange={(e) => {
                  setStreet1(e.target.value);
                  if (errors.street1) setErrors({ ...errors, street1: undefined });
                }}
                data-dd-privacy="mask"
              />
              <FormErrorMessage>{errors.street1}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="street2" fontSize="sm">
                Apartment, suite, etc. (optional)
              </FormLabel>
              <Input
                id="street2"
                placeholder="Apt 4B"
                value={street2}
                onChange={(e) => setStreet2(e.target.value)}
                data-dd-privacy="mask"
              />
            </FormControl>

            <FormControl isInvalid={!!errors.city} isRequired>
              <FormLabel htmlFor="city" fontSize="sm">
                City
              </FormLabel>
              <Input
                id="city"
                placeholder="New York"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  if (errors.city) setErrors({ ...errors, city: undefined });
                }}
                data-dd-privacy="mask"
              />
              <FormErrorMessage>{errors.city}</FormErrorMessage>
            </FormControl>

            <HStack spacing={4} align="start">
              <FormControl isInvalid={!!errors.state} isRequired flex={1}>
                <FormLabel htmlFor="state" fontSize="sm">
                  State
                </FormLabel>
                <Select
                  id="state"
                  name="state"
                  title="State"
                  aria-label="State"
                  placeholder="Select state"
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);
                    if (errors.state) setErrors({ ...errors, state: undefined });
                  }}
                >
                  {US_STATES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.state}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.postalCode} isRequired flex={1}>
                <FormLabel htmlFor="postalCode" fontSize="sm">
                  ZIP code
                </FormLabel>
                <Input
                  id="postalCode"
                  placeholder="10001"
                  value={postalCode}
                  onChange={(e) => {
                    setPostalCode(e.target.value);
                    if (errors.postalCode) setErrors({ ...errors, postalCode: undefined });
                  }}
                  maxLength={10}
                  data-dd-privacy="mask"
                />
                <FormErrorMessage>{errors.postalCode}</FormErrorMessage>
              </FormControl>
            </HStack>

            {submitError && (
              <Text color="red.500" fontSize="sm">
                {submitError}
              </Text>
            )}
          </VStack>
        </VStack>
      </Box>
    );
  }
);

AddressForm.displayName = 'AddressForm';
