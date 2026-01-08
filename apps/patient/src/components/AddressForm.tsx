import { useState } from 'react';
import {
  Box,
  Button,
  Container,
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
import { updatePatientAddress } from '../api';
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
  order: Order;
  onSuccess: () => void;
}

interface FormErrors {
  street1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export const AddressForm = ({ patientId, order, onSuccess }: AddressFormProps) => {
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

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await updatePatientAddress(patientId, {
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

      onSuccess();
    } catch (e: any) {
      setSubmitError(e.message || 'Failed to update address. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box bgColor="white" minH="100vh">
      <Container py={8}>
        <VStack spacing={6} align="stretch">
          <VStack spacing={3} align="center" textAlign="center">
            <Box p={3} borderRadius="full" bgColor="blue.50" color="blue.500">
              <Icon as={FiMapPin} boxSize={6} />
            </Box>
            <Heading as="h2" size="lg">
              Add your address
            </Heading>
            <Text color="gray.600">
              We need your address to help you find nearby pharmacies and for delivery options.
            </Text>
          </VStack>

          <VStack spacing={4} align="stretch" pt={4}>
            <FormControl isInvalid={!!errors.street1} isRequired>
              <FormLabel>Street address</FormLabel>
              <Input
                placeholder="123 Main St"
                value={street1}
                onChange={(e) => {
                  setStreet1(e.target.value);
                  if (errors.street1) setErrors({ ...errors, street1: undefined });
                }}
                size="lg"
                data-dd-privacy="mask"
              />
              <FormErrorMessage>{errors.street1}</FormErrorMessage>
            </FormControl>

            <FormControl>
              <FormLabel>Apartment, suite, etc. (optional)</FormLabel>
              <Input
                placeholder="Apt 4B"
                value={street2}
                onChange={(e) => setStreet2(e.target.value)}
                size="lg"
                data-dd-privacy="mask"
              />
            </FormControl>

            <FormControl isInvalid={!!errors.city} isRequired>
              <FormLabel>City</FormLabel>
              <Input
                placeholder="New York"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  if (errors.city) setErrors({ ...errors, city: undefined });
                }}
                size="lg"
                data-dd-privacy="mask"
              />
              <FormErrorMessage>{errors.city}</FormErrorMessage>
            </FormControl>

            <HStack spacing={4} align="start">
              <FormControl isInvalid={!!errors.state} isRequired flex={1}>
                <FormLabel>State</FormLabel>
                <Select
                  id="state-select"
                  name="state-select"
                  title="State"
                  aria-label="State"
                  placeholder="Select state"
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);
                    if (errors.state) setErrors({ ...errors, state: undefined });
                  }}
                  size="lg"
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
                <FormLabel>ZIP code</FormLabel>
                <Input
                  placeholder="10001"
                  value={postalCode}
                  onChange={(e) => {
                    setPostalCode(e.target.value);
                    if (errors.postalCode) setErrors({ ...errors, postalCode: undefined });
                  }}
                  size="lg"
                  maxLength={10}
                  data-dd-privacy="mask"
                />
                <FormErrorMessage>{errors.postalCode}</FormErrorMessage>
              </FormControl>
            </HStack>

            {submitError && (
              <Text color="red.500" fontSize="sm" textAlign="center">
                {submitError}
              </Text>
            )}

            <Button
              variant="brand"
              size="lg"
              w="full"
              mt={4}
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText="Saving..."
            >
              Continue
            </Button>
          </VStack>
        </VStack>
      </Container>
    </Box>
  );
};
