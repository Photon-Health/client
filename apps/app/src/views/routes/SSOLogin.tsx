import { CircularProgress, Container, Heading, Stack, useBreakpointValue } from '@chakra-ui/react';
import { useSearchParams } from 'react-router-dom';

import { usePhoton } from '@photonhealth/react';
import { Logo } from '../components/Logo';
import { useEffect, useRef } from 'react';
import { datadogRum } from '@datadog/browser-rum';

export const SSOLogin = () => {
  const breakpoint = useBreakpointValue({ base: 'xs', md: 'sm' });
  const { login, logout, isAuthenticated, isLoading } = usePhoton();
  const [searchParams] = useSearchParams();

  const connection = searchParams.get('connection') ?? undefined;
  const returnTo = searchParams.get('returnTo') ?? undefined;

  const alreadyLoggedOut = searchParams.get('loggedOut') === '1';

  const loginInitiated = useRef(false);

  // iOS WKWebView suspends iframes when backgrounded, which can leave checkSession()
  // (and thus isLoading) stuck forever. Reload on foreground to recover.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isLoading) {
        window.location.reload();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) {
      datadogRum.addAction('SSOLogin-Debug', { state: 'isLoading' });
      return;
    }
    if (isAuthenticated && !alreadyLoggedOut) {
      datadogRum.addAction('SSOLogin-Debug', { state: 'isAuthenticated' });
      // Logout first in case user has a session with a different org/connection.
      // loggedOut=1 prevents a logout→silent-reauth→logout loop when the IDP session persists.
      const url = new URL(window.location.href);
      url.searchParams.set('loggedOut', '1');
      logout({ federated: false, returnTo: url.toString() });
      return;
    }

    console.log('ZAC RETURN TO', returnTo);
    if (isCurrentOriginAllowed()) {
      if (returnTo) {
        console.log('ZAC RETURN TO INSIDE');
        localStorage.setItem('authReturnTo', returnTo);
      }
    }

    // help guarantee no extra login call causes shenanigans during SSO
    if (loginInitiated.current) return;
    loginInitiated.current = true;

    datadogRum.addAction('SSOLogin-Debug', { state: 'login' });
    login({
      connection
    });
    // login/logout are not memoized in PhotonProvider — omitting from deps to prevent
    // re-fires on every provider render. TODO: wrap them in useCallback(fn, [client]) in
    // PhotonProvider, which would also remove the need for the loginInitiated ref guard.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isAuthenticated, alreadyLoggedOut, connection, returnTo]);

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
  try {
    const currentOrigin = window.location.origin;
    return (
      currentOrigin === 'http://localhost:3000' ||
      /^https:\/\/app(-[a-z0-9-]+)?\.boson\.health$/.test(currentOrigin) ||
      currentOrigin === 'https://app.neutron.health' ||
      currentOrigin === 'https://app.photon.health'
    );
  } catch {
    return false;
  }
}
