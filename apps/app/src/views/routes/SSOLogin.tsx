import { CircularProgress, Container, Heading, Stack, useBreakpointValue } from '@chakra-ui/react';
import { useSearchParams } from 'react-router-dom';

import { usePhoton } from '@photonhealth/react';
import { Logo } from '../components/Logo';
import { useEffect } from 'react';

export const SSOLogin = () => {
  const breakpoint = useBreakpointValue({ base: 'xs', md: 'sm' });
  const { login } = usePhoton();
  const [searchParams] = useSearchParams();

  const connection = searchParams.get('connection') ?? undefined;
  const returnTo = searchParams.get('returnTo') ?? undefined;

  useEffect(() => {
    if (isCurrentOriginAllowed()) {
      if (returnTo) {
        localStorage.setItem('authReturnTo', returnTo);
      }
    }

    login({
      connection
    });
  });

  return (
    <Container maxW="md" py={{ base: '12', md: '24' }}>
      <Stack spacing="8" textAlign="center">
        <Logo bgIsWhite margin="auto" />
        <Heading size={breakpoint}>Signing in...</Heading>
        <CircularProgress isIndeterminate color="green.300" margin="auto" />
      </Stack>
    </Container>
  );
};

function isCurrentOriginAllowed(): boolean {
  const allowedDomains = [
    'http://localhost:3000',
    'https://app.neutron.health',
    'https://app.photon.health'
  ];

  try {
    const currentOrigin = window.location.origin;
    return allowedDomains.some((domain) => {
      return currentOrigin === domain;
    });
  } catch {
    return false;
  }
}
