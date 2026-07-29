import { beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, waitFor } from '@solidjs/testing-library';
import { setupServer } from 'msw/node';
import { defaultHandlers } from '@photonhealth/sdk/test-utils';
import {
  LOGIN_LOOP_MAX_ATTEMPTS,
  recordLoginAttempt,
  resetLoginRedirectLatch
} from '@photonhealth/sdk';
import { stubGoogleMaps } from '../test-utils/stub-google-maps';
import { renderPhotonClient } from './test-utils/test-element-setup';
import { matchesExternalUserId } from './photon-client-component';

const CLIENT_ID = 'test-client';
const LOGGED_IN_SUB = 'auth0|usr_testId1111';

vi.mock('solid-element', () => ({ customElement: vi.fn() }));

// Shared mocks (rather than per-instance) so assertions can reach the calls the
// component makes through its internally-constructed PhotonClient.
const { auth0 } = vi.hoisted(() => ({
  auth0: {
    checkSession: vi.fn(),
    isAuthenticated: vi.fn(),
    getUser: vi.fn(),
    getTokenSilently: vi.fn(),
    getTokenWithPopup: vi.fn(),
    loginWithRedirect: vi.fn(),
    handleRedirectCallback: vi.fn(),
    logout: vi.fn()
  }
}));

vi.mock('@auth0/auth0-spa-js', () => ({
  Auth0Client: class {
    checkSession = auth0.checkSession;
    isAuthenticated = auth0.isAuthenticated;
    getUser = auth0.getUser;
    getTokenSilently = auth0.getTokenSilently;
    getTokenWithPopup = auth0.getTokenWithPopup;
    loginWithRedirect = auth0.loginWithRedirect;
    handleRedirectCallback = auth0.handleRedirectCallback;
    logout = auth0.logout;
  }
}));

const server = setupServer(...defaultHandlers);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'bypass' });
  stubGoogleMaps();
});

beforeEach(() => {
  window.sessionStorage.clear();
  // Each render stands in for a fresh page load, and a real login redirect
  // would have navigated away and discarded this latch.
  resetLoginRedirectLatch();
  auth0.checkSession.mockResolvedValue(undefined);
  auth0.isAuthenticated.mockResolvedValue(true);
  auth0.getUser.mockResolvedValue({ sub: LOGGED_IN_SUB });
  auth0.getTokenSilently.mockResolvedValue('test-access-token');
  auth0.getTokenWithPopup.mockResolvedValue('test-access-token');
  auth0.loginWithRedirect.mockResolvedValue(undefined);
  auth0.handleRedirectCallback.mockResolvedValue({});
  auth0.logout.mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  vi.clearAllMocks();
});

afterAll(() => server.close());

describe('matchesExternalUserId', () => {
  test('matches the bare provider id', () => {
    expect(matchesExternalUserId('auth0|usr_abc', 'usr_abc')).toBe(true);
  });

  test('matches the full sub, which hosts also pass', () => {
    expect(matchesExternalUserId('auth0|usr_abc', 'auth0|usr_abc')).toBe(true);
  });

  test('does not match on a substring', () => {
    expect(matchesExternalUserId('auth0|usr_abc', 'abc')).toBe(false);
  });

  test('does not match when there is no user', () => {
    expect(matchesExternalUserId(undefined, 'usr_abc')).toBe(false);
  });
});

describe('user switching', () => {
  test('clears the session without navigating, then forces re-authentication', async () => {
    renderPhotonClient({ id: CLIENT_ID, externalUserId: 'usr_somebodyElse' });

    await waitFor(() => {
      expect(auth0.loginWithRedirect).toHaveBeenCalled();
    });

    // Two competing navigations were the race; the logout must not navigate.
    expect(auth0.logout).toHaveBeenCalledWith(expect.objectContaining({ openUrl: false }));
    // Without prompt=login the SSO cookie hands back the same user, so a real
    // mismatch could never resolve.
    expect(auth0.loginWithRedirect).toHaveBeenCalledWith(
      expect.objectContaining({
        authorizationParams: expect.objectContaining({ prompt: 'login' })
      })
    );
  });

  test('switches only once, even as the logout churns auth state', async () => {
    renderPhotonClient({ id: CLIENT_ID, externalUserId: 'usr_somebodyElse' });

    await waitFor(() => {
      expect(auth0.loginWithRedirect).toHaveBeenCalled();
    });
    // Let any further effect runs settle.
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(auth0.loginWithRedirect).toHaveBeenCalledTimes(1);
  });

  test('leaves a matching user alone', async () => {
    renderPhotonClient({ id: CLIENT_ID, externalUserId: 'usr_testId1111' });

    await waitFor(() => {
      expect(auth0.getUser).toHaveBeenCalled();
    });
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(auth0.logout).not.toHaveBeenCalled();
    expect(auth0.loginWithRedirect).not.toHaveBeenCalled();
  });

  test('leaves a user matching by full sub alone', async () => {
    renderPhotonClient({ id: CLIENT_ID, externalUserId: LOGGED_IN_SUB });

    await waitFor(() => {
      expect(auth0.getUser).toHaveBeenCalled();
    });
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(auth0.loginWithRedirect).not.toHaveBeenCalled();
  });
});

describe('autoLogin', () => {
  test('logs in once when there is genuinely no session', async () => {
    auth0.checkSession.mockRejectedValue(
      Object.assign(new Error('login_required'), {
        error: 'login_required'
      })
    );
    auth0.isAuthenticated.mockResolvedValue(false);
    auth0.getUser.mockResolvedValue(undefined);

    renderPhotonClient({ id: CLIENT_ID, autoLogin: true });

    await waitFor(() => {
      expect(auth0.loginWithRedirect).toHaveBeenCalled();
    });
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(auth0.loginWithRedirect).toHaveBeenCalledTimes(1);
  });

  test('does not log in when the session could not be verified', async () => {
    // A blocked silent-auth iframe. Redirecting here is the loop: Auth0
    // succeeds, we come back, and the iframe is still blocked.
    auth0.checkSession.mockRejectedValue(Object.assign(new Error('Timeout'), { error: 'timeout' }));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const { container } = renderPhotonClient({ id: CLIENT_ID, autoLogin: true });

    await waitFor(() => {
      expect(container.querySelector('[role="alert"]')).toBeTruthy();
    });

    expect(auth0.loginWithRedirect).not.toHaveBeenCalled();
  });
});

describe('circuit breaker', () => {
  test('surfaces a message instead of adding another redirect', async () => {
    // Stand in for having already looped through several page loads.
    for (let i = 0; i < LOGIN_LOOP_MAX_ATTEMPTS; i++) {
      recordLoginAttempt(CLIENT_ID);
    }
    auth0.checkSession.mockRejectedValue(
      Object.assign(new Error('login_required'), { error: 'login_required' })
    );
    auth0.isAuthenticated.mockResolvedValue(false);
    auth0.getUser.mockResolvedValue(undefined);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const { container } = renderPhotonClient({ id: CLIENT_ID, autoLogin: true });

    await waitFor(() => {
      const alert = container.querySelector('[role="alert"]');
      expect(alert?.textContent).toBeTruthy();
    });

    expect(auth0.loginWithRedirect).not.toHaveBeenCalled();
  });
});
