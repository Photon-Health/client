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

  // Guard against duplicate login() calls. loginWithRedirect() starts a PKCE transaction
  // and initiates a redirect — calling it multiple times concurrently can corrupt Auth0 SDK
  // internal state, leading to failed auth callbacks or infinite spinners.
  const loginInitiated = useRef(false);

  // On iOS, backgrounding the app suspends WKWebView network activity and iframes.
  // If checkSession() (which uses a hidden iframe for silent auth) was in progress when the
  // app was backgrounded, it may never resolve, leaving isLoading stuck as true forever.
  // When the webview becomes visible again, reload to restart the auth flow cleanly.
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
      // Logout before attempting a login, in case user has existing session with another org
      // that doesn't use the SSO connection. We append loggedOut=1 to the returnTo URL so
      // that when Auth0 redirects back after logout, we skip this branch and proceed to
      // login(). Without this, non-federated logout + an active IDP session
      // causes Auth0 checkSession() to silently re-authenticate on every page load, creating
      // a logout→re-auth→logout loop (~3s per cycle).
      const url = new URL(window.location.href);
      url.searchParams.set('loggedOut', '1');
      logout({ federated: false, returnTo: url.toString() });
      return;
    }

    if (isCurrentOriginAllowed()) {
      if (returnTo) {
        localStorage.setItem('authReturnTo', returnTo);
      }
    }

    if (loginInitiated.current) return;
    loginInitiated.current = true;

    datadogRum.addAction('SSOLogin-Debug', { state: 'login' });
    login({
      connection
    });
    // login and logout are not memoized in PhotonProvider — they are recreated on every
    // render. Including them in the dependency array would re-fire this effect on any
    // provider re-render, potentially calling login() or logout() again mid-redirect.
    // TODO: Wrapping login/logout in useCallback(fn, [client]) in PhotonProvider would make
    // them referentially stable and remove the need for this dep omission and the
    // loginInitiated ref guard.
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
