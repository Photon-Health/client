import { Button, Container, FormControl, FormLabel, Input, Stack } from '@chakra-ui/react';
import { useSearchParams } from 'react-router-dom';
import { auth0Config } from '../../../../configs/auth';
import { useState } from 'react';

export const SelfSignupPage = () => {
  const [searchParams] = useSearchParams();
  const [npiInput, setNpiInput] = useState('');
  const state = searchParams.get('state') ?? undefined;
  const sessionToken = searchParams.get('session_token') ?? undefined;

  if (!state) {
    return <div>Error: no state</div>;
  }

  const { firstName, lastName, email } = extractTokenData(sessionToken);

  const onAcceptClick = async () => {
    window.location.href = `https://${auth0Config.domain}/continue?state=${state}&did_accept_tos=true&npi=${npiInput}`;
  };

  return (
    <Container maxW="md" py={{ base: '12' }}>
      <Stack spacing="8" textAlign="center">
        <h1>Terms of Service</h1>
        <p>
          {firstName} {lastName}
        </p>
        <p>{email}</p>
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
