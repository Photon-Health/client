import { Button, Container, Stack } from '@chakra-ui/react';
import { useSearchParams } from 'react-router-dom';
import { auth0Config } from '../../../../configs/auth';

export const TermsOfServicePage = () => {
  const [searchParams] = useSearchParams();
  const state = searchParams.get('state') ?? undefined;
  if (!state) {
    return <div>Error: no state</div>;
  }

  const onAcceptClick = () => {
    window.location.href = `https://${auth0Config.domain}/continue?state=${state}`;
  };

  return (
    <Container maxW="md" py={{ base: '12' }}>
      <Stack spacing="8" textAlign="center">
        <h1>Terms of Service</h1>
        <Button onClick={onAcceptClick}>Accept</Button>
      </Stack>
    </Container>
  );
};
