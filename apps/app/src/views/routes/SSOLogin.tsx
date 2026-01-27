import { CircularProgress, Container, Heading, Stack, useBreakpointValue } from '@chakra-ui/react';
import { useSearchParams } from 'react-router-dom';

import { usePhoton } from '@photonhealth/react';
import { Logo } from '../components/Logo';
import { useEffect } from 'react';
import { datadogRum } from '@datadog/browser-rum';

export const SSOLogin = () => {
  const breakpoint = useBreakpointValue({ base: 'xs', md: 'sm' });
  const { login, logout, isAuthenticated, isLoading } = usePhoton();
  const [searchParams] = useSearchParams();

  const connection = searchParams.get('connection') ?? undefined;
  const returnTo = searchParams.get('returnTo') ?? undefined;

  const alreadyLoggedOut = searchParams.get('loggedOut') === '1';

  useEffect(() => {
    if (isLoading) {
      datadogRum.addAction('SSOLogin-Debug', { state: 'isLoading' });
      return;
    }
    if (isAuthenticated && !alreadyLoggedOut) {
      datadogRum.addAction('SSOLogin-Debug', { state: 'isAuthenticated' });
      const url = new URL(window.location.href);
      url.searchParams.set('loggedOut', '1');
      // logout before attempting a login, in case user has existing session with another org
      // that doesn't use the SSO connection
      logout({ federated: false, returnTo: window.location.href });
      return;
    }

    if (isCurrentOriginAllowed()) {
      if (returnTo) {
        localStorage.setItem('authReturnTo', returnTo);
      }
    }

    datadogRum.addAction('SSOLogin-Debug', { state: 'login' });
    login({
      connection
    });
  }, [isLoading, isAuthenticated, login, logout, connection, returnTo, alreadyLoggedOut]);

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
    'https://app.boson.health',
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
