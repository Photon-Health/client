import { Button, Container, Stack } from '@chakra-ui/react';
import { useSearchParams } from 'react-router-dom';
import { auth0Config } from '../../../../configs/auth';

export const SelfSignupPage = () => {
  const [searchParams] = useSearchParams();
  const state = searchParams.get('state') ?? undefined;
  const sessionToken = searchParams.get('session_token') ?? undefined;

  if (!state) {
    return <div>Error: no state</div>;
  }

  const { firstName, lastName, email } = extractTokenData(sessionToken);

  const onAcceptClick = async () => {
    window.location.href = `https://${auth0Config.domain}/continue?state=${state}&did_accept_tos=true`;
  };

  return (
    <Container maxW="md" py={{ base: '12' }}>
      <Stack spacing="8" textAlign="center">
        <h1>Terms of Service</h1>
        <p>
          {firstName} {lastName}
        </p>
        <p>{email}</p>
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
