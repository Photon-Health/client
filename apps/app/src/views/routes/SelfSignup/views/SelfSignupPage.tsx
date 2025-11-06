import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Link,
  Stack,
  Text,
  useBreakpointValue,
  VStack
} from '@chakra-ui/react';
import { useSearchParams } from 'react-router-dom';
import { auth0Config } from '../../../../configs/auth';
import { useState } from 'react';
import { Logo } from '../../../components/Logo';

interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  npi: string;
  street1: string;
  street2: string;
  city: string;
  state: string;
  zip: string;
  didAgreeToTerms: boolean;
}

export const SelfSignupPage = () => {
  const [searchParams] = useSearchParams();

  const state = searchParams.get('state') ?? undefined;
  const sessionToken = searchParams.get('session_token') ?? undefined;

  if (!state) {
    return <div>Error: no state</div>;
  }

  const { firstName, lastName, email } = extractTokenData(sessionToken);

  const [firstNameInput, setFirstNameInput] = useState(firstName || '');
  const [lastNameInput, setLastNameInput] = useState(lastName || '');
  const [emailInput, setEmailInput] = useState(email || '');
  const [npiInput, setNpiInput] = useState('');

  const [street1Input, setStreet1Input] = useState('');
  const [street2Input, setStreet2Input] = useState('');
  const [zipInput, setZipInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [stateInput, setStateInput] = useState('');
  const [didAgreeInput, setDidAgreeInput] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const onCreateAccountClick = async () => {
    const formData: SignupFormData = {
      firstName: firstNameInput,
      lastName: lastNameInput,
      email: emailInput,
      npi: npiInput,
      street1: street1Input,
      street2: street2Input,
      city: cityInput,
      state: stateInput,
      zip: zipInput,
      didAgreeToTerms: didAgreeInput
    };

    const validationErrors = validateSignupForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    const queryParams = buildSignupContinueParams(state, formData);
    window.location.href = `https://${auth0Config.domain}/continue?${queryParams}`;
  };

  return (
    <>
      <Box as="nav" bg="#001740" py="3">
        <Container>
          <Logo pr="4" />
        </Container>
      </Box>
      <Container maxW="md" py={{ base: '12' }} bgColor="white">
        <Stack spacing="4" textAlign="left">
          <Alert status="warning">
            <AlertIcon />
            <VStack alignItems="start">
              <Text fontWeight="bold">Required before writing prescriptions</Text>
            </VStack>
          </Alert>
          <Heading size={useBreakpointValue({ base: 'xs' })}>
            Create Your Prescriber Account
            <Text fontSize="md">Please confirm your details:</Text>
          </Heading>
          <FormControl isInvalid={!!errors.firstName}>
            <FormLabel htmlFor="firstName">First Name</FormLabel>
            <Input
              id="firstName"
              value={firstNameInput}
              onChange={(e) => setFirstNameInput(e.target.value)}
              placeholder="First Name"
              autoComplete="given-name"
            />
            <FormErrorMessage>{errors.firstName}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.lastName}>
            <FormLabel htmlFor="lastName">Last Name</FormLabel>
            <Input
              id="lastName"
              value={lastNameInput}
              onChange={(e) => setLastNameInput(e.target.value)}
              placeholder="Last Name"
              autoComplete="family-name"
            />
            <FormErrorMessage>{errors.lastName}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.email}>
            <FormLabel htmlFor="email">Email</FormLabel>
            <Input
              id="email"
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Email Address"
              autoComplete="email"
            />
            <FormErrorMessage>{errors.email}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.npi}>
            <FormLabel htmlFor="npi">NPI</FormLabel>
            <Input
              id="npi"
              value={npiInput}
              onChange={(e) => setNpiInput(e.target.value)}
              placeholder="Enter your 10-digit NPI"
              maxLength={10}
              minLength={10}
            />
            <FormErrorMessage>{errors.npi}</FormErrorMessage>
          </FormControl>

          <Heading size="xs">Address</Heading>

          <FormControl isInvalid={!!errors.street1}>
            <FormLabel htmlFor="street1">Street 1</FormLabel>
            <Input
              id="street1"
              value={street1Input}
              onChange={(e) => setStreet1Input(e.target.value)}
              placeholder="Street 1"
              autoComplete="address-line1"
            />
            <FormErrorMessage>{errors.street1}</FormErrorMessage>
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="street2">Street 2</FormLabel>
            <Input
              id="street2"
              value={street2Input}
              onChange={(e) => setStreet2Input(e.target.value)}
              placeholder="Street 2 (optional)"
              autoComplete="address-line2"
            />
          </FormControl>

          <FormControl isInvalid={!!errors.city}>
            <FormLabel htmlFor="city">City</FormLabel>
            <Input
              id="city"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              placeholder="City"
              autoComplete="address-level2"
            />
            <FormErrorMessage>{errors.city}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.state}>
            <FormLabel htmlFor="state">State</FormLabel>
            <Input
              id="state"
              value={stateInput}
              onChange={(e) => setStateInput(e.target.value)}
              placeholder="State"
              autoComplete="address-level1"
            />
            <FormErrorMessage>{errors.state}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.zip}>
            <FormLabel htmlFor="zip">ZIP Code</FormLabel>
            <Input
              id="zip"
              value={zipInput}
              onChange={(e) => setZipInput(e.target.value)}
              placeholder="ZIP Code"
              autoComplete="postal-code"
            />
            <FormErrorMessage>{errors.zip}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.agreement}>
            <Checkbox
              isChecked={didAgreeInput}
              onChange={(e) => setDidAgreeInput(e.target.checked)}
            >
              <Text fontWeight="bold" fontSize="md" display="inline">
                I agree
              </Text>
            </Checkbox>{' '}
            <Text fontSize="md" display="inline">
              that by creating an account and prescribing with Photon Health, Inc., I am authorized
              and licensed to prescribe, and I accept Photon Health's{' '}
              <Link href="https://www.photon.health/terms">Terms of Service</Link> and{' '}
              <Link href="https://www.photon.health/baa">Business Associate Agreement (BAA)</Link>.
            </Text>
            <FormErrorMessage>{errors.agreement}</FormErrorMessage>
          </FormControl>

          <Button onClick={onCreateAccountClick}>Create Account</Button>
        </Stack>
      </Container>
    </>
  );
};

function extractTokenData(tosSessionToken?: string) {
  if (!tosSessionToken) {
    return {};
  }
  const [, payload] = tosSessionToken.split('.');
  const decodedPayload = JSON.parse(atob(payload));
  const firstName: string = decodedPayload.first_name;
  const lastName: string = decodedPayload.last_name;
  const email: string = decodedPayload.email;
  return { firstName, lastName, email };
}

const buildSignupContinueParams = (state: string, formData: SignupFormData): string => {
  const params = new URLSearchParams({
    state,
    did_accept_tos: 'true',
    first_name: formData.firstName,
    last_name: formData.lastName,
    email: formData.email,
    npi: formData.npi,
    street1: formData.street1,
    street2: formData.street2,
    city: formData.city,
    state_address: formData.state,
    zip: formData.zip,
    didAgreeToTerms: formData.didAgreeToTerms.toString()
  });

  return params.toString();
};

const validateSignupForm = (formData: SignupFormData): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!formData.firstName.trim()) {
    errors.firstName = 'First name is required';
  }
  if (!formData.lastName.trim()) {
    errors.lastName = 'Last name is required';
  }
  if (!formData.email.trim()) {
    errors.email = 'Email is required';
  }
  if (!formData.npi.trim()) {
    errors.npi = 'NPI is required';
  } else if (!/^\d{10}$/.test(formData.npi)) {
    errors.npi = 'NPI must be a 10-digit number';
  }
  if (!formData.street1.trim()) {
    errors.street1 = 'Street address is required';
  }
  if (!formData.city.trim()) {
    errors.city = 'City is required';
  }
  if (!formData.state.trim()) {
    errors.state = 'State is required';
  }
  if (!formData.zip.trim()) {
    errors.zip = 'ZIP code is required';
  }
  if (!formData.didAgreeToTerms) {
    errors.agreement = 'You must agree to the Terms of Service and BAA';
  }

  return errors;
};
