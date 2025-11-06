import { Button, Container, FormControl, FormLabel, Input, Stack } from '@chakra-ui/react';
import { useSearchParams } from 'react-router-dom';
import { auth0Config } from '../../../../configs/auth';
import { useState } from 'react';

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

  const onAcceptClick = async () => {
    const queryParams = buildSignupContinueParams(state, {
      firstName: firstNameInput,
      lastName: lastNameInput,
      email: emailInput,
      npi: npiInput,
      street1: street1Input,
      street2: street2Input,
      city: cityInput,
      state: stateInput,
      zip: zipInput
    });
    window.location.href = `https://${auth0Config.domain}/continue?${queryParams}`;
  };

  return (
    <Container maxW="md" py={{ base: '12' }}>
      <Stack spacing="8" textAlign="center">
        <h1>Terms of Service</h1>

        <FormControl>
          <FormLabel htmlFor="firstName">First Name</FormLabel>
          <Input
            id="firstName"
            value={firstNameInput}
            onChange={(e) => setFirstNameInput(e.target.value)}
            placeholder="First Name"
          />
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="lastName">Last Name</FormLabel>
          <Input
            id="lastName"
            value={lastNameInput}
            onChange={(e) => setLastNameInput(e.target.value)}
            placeholder="Last Name"
          />
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="email">Email</FormLabel>
          <Input
            id="email"
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="Email Address"
          />
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="npi">NPI</FormLabel>
          <Input
            id="npi"
            value={npiInput}
            onChange={(e) => setNpiInput(e.target.value)}
            placeholder="Enter your 10-digit NPI"
            maxLength={10}
            minLength={10}
          />
        </FormControl>

        <p>Address</p>

        <FormControl>
          <FormLabel htmlFor="street1">Street 1</FormLabel>
          <Input
            id="street1"
            value={street1Input}
            onChange={(e) => setStreet1Input(e.target.value)}
            placeholder="Street 1"
          />
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="street2">Street 2</FormLabel>
          <Input
            id="street2"
            value={street2Input}
            onChange={(e) => setStreet2Input(e.target.value)}
            placeholder="Street 2 (optional)"
          />
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="city">City</FormLabel>
          <Input
            id="city"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            placeholder="City"
          />
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="state">State</FormLabel>
          <Input
            id="state"
            value={stateInput}
            onChange={(e) => setStateInput(e.target.value)}
            placeholder="State"
          />
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="zip">ZIP Code</FormLabel>
          <Input
            id="zip"
            value={zipInput}
            onChange={(e) => setZipInput(e.target.value)}
            placeholder="ZIP Code"
          />
        </FormControl>

        <Button onClick={onAcceptClick}>Accept</Button>
      </Stack>
    </Container>
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
    zip: formData.zip
  });

  return params.toString();
};
