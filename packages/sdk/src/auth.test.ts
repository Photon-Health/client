import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { Auth0Client } from '@auth0/auth0-spa-js';
import { AuthManager, stripAuthParams } from './auth';
import { LoginLoopError, LOGIN_LOOP_MAX_ATTEMPTS, resetLoginRedirectLatch } from './loginLoopGuard';

const CLIENT_ID = 'test-client';

/**
 * A real login redirect navigates, discarding the in-flight latch. Nothing
 * navigates under test, so simulate the page load between logins explicitly.
 */
function simulatePageLoad() {
  resetLoginRedirectLatch();
}

/** Mirrors how auth0-spa-js reports failures: a code on the `error` property. */
function auth0Error(code: string, message = code) {
  return Object.assign(new Error(message), { error: code });
}

function makeAuth0Client(overrides: Partial<Auth0Client> = {}) {
  return {
    getTokenSilently: vi.fn().mockResolvedValue('a-token'),
    getTokenWithPopup: vi.fn().mockResolvedValue('a-popup-token'),
    loginWithRedirect: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn().mockResolvedValue(undefined),
    checkSession: vi.fn().mockResolvedValue(undefined),
    isAuthenticated: vi.fn().mockResolvedValue(true),
    getUser: vi.fn().mockResolvedValue({ sub: 'auth0|usr_1' }),
    handleRedirectCallback: vi.fn().mockResolvedValue({}),
    ...overrides
  } as unknown as Auth0Client;
}

function makeManager(auth0: Auth0Client) {
  return new AuthManager({
    authentication: auth0,
    audience: 'https://api.photon.health',
    clientId: CLIENT_ID
  });
}

beforeEach(() => {
  window.sessionStorage.clear();
  resetLoginRedirectLatch();
  vi.restoreAllMocks();
});

describe('stripAuthParams', () => {
  test('removes Auth0 redirect params', () => {
    expect(stripAuthParams('?code=abc&state=xyz&photon=true')).toBe('');
  });

  test('keeps the host app own params', () => {
    expect(stripAuthParams('?patientId=pat_1&code=abc&state=xyz')).toBe('?patientId=pat_1');
  });

  test('handles an empty search string', () => {
    expect(stripAuthParams('')).toBe('');
  });

  test('removes the error params an aborted login leaves behind', () => {
    expect(stripAuthParams('?error=access_denied&error_description=nope&state=xyz')).toBe('');
  });
});

describe('getAccessToken', () => {
  test('returns the silently acquired token', async () => {
    const auth0 = makeAuth0Client();

    await expect(makeManager(auth0).getAccessToken()).resolves.toBe('a-token');
  });

  test('does not redirect when redirectOnFailure is false', async () => {
    const auth0 = makeAuth0Client({
      getTokenSilently: vi.fn().mockRejectedValue(auth0Error('login_required'))
    });
    const manager = makeManager(auth0);

    await expect(manager.getAccessToken({ redirectOnFailure: false })).rejects.toThrow(
      'login_required'
    );
    // The whole point of the fix: a background caller must not navigate away.
    expect(auth0.loginWithRedirect).not.toHaveBeenCalled();
  });

  test('propagates the underlying reason rather than swallowing it', async () => {
    const auth0 = makeAuth0Client({
      getTokenSilently: vi.fn().mockRejectedValue(auth0Error('timeout', 'Timeout'))
    });

    await expect(makeManager(auth0).getAccessToken({ redirectOnFailure: false })).rejects.toThrow(
      'Timeout'
    );
  });

  test('treats an empty token as a failure', async () => {
    const auth0 = makeAuth0Client({
      getTokenSilently: vi.fn().mockResolvedValue('')
    });

    await expect(makeManager(auth0).getAccessToken({ redirectOnFailure: false })).rejects.toThrow(
      /empty access token/
    );
  });

  test('redirects once when the caller opts in', async () => {
    const auth0 = makeAuth0Client({
      getTokenSilently: vi.fn().mockRejectedValue(auth0Error('login_required'))
    });

    await expect(makeManager(auth0).getAccessToken()).rejects.toThrow();
    // Previously this recursed for a "retry once", doubling /authorize traffic.
    expect(auth0.loginWithRedirect).toHaveBeenCalledTimes(1);
  });

  test('strips spent auth params from the preserved returnTo', async () => {
    const auth0 = makeAuth0Client({
      getTokenSilently: vi.fn().mockRejectedValue(auth0Error('login_required'))
    });
    window.history.pushState({}, '', '/prescriptions/new?patientId=pat_1&code=abc&state=xyz');

    await expect(makeManager(auth0).getAccessToken()).rejects.toThrow();

    expect(auth0.loginWithRedirect).toHaveBeenCalledWith(
      expect.objectContaining({
        appState: { returnTo: '/prescriptions/new?patientId=pat_1' }
      })
    );
  });

  test('falls back to a consent popup', async () => {
    const auth0 = makeAuth0Client({
      getTokenSilently: vi.fn().mockRejectedValue(new Error('Consent required'))
    });

    await expect(makeManager(auth0).getAccessToken()).resolves.toBe('a-popup-token');
  });

  test('a dismissed consent popup does not resolve to an empty token', async () => {
    const auth0 = makeAuth0Client({
      getTokenSilently: vi.fn().mockRejectedValue(new Error('Consent required')),
      getTokenWithPopup: vi.fn().mockResolvedValue(undefined)
    });

    await expect(makeManager(auth0).getAccessToken({ redirectOnFailure: false })).rejects.toThrow(
      'Consent required'
    );
  });
});

describe('login', () => {
  test('forwards prompt and login_hint to Auth0', async () => {
    const auth0 = makeAuth0Client();

    await makeManager(auth0).login({ prompt: 'login', loginHint: 'someone@example.com' });

    expect(auth0.loginWithRedirect).toHaveBeenCalledWith(
      expect.objectContaining({
        authorizationParams: expect.objectContaining({
          prompt: 'login',
          login_hint: 'someone@example.com'
        })
      })
    );
  });

  test('refuses to add another redirect once the breaker trips', async () => {
    const auth0 = makeAuth0Client();
    const manager = makeManager(auth0);

    for (let i = 0; i < LOGIN_LOOP_MAX_ATTEMPTS; i++) {
      simulatePageLoad();
      await manager.login({});
    }

    simulatePageLoad();
    await expect(manager.login({})).rejects.toThrow(LoginLoopError);
    expect(auth0.loginWithRedirect).toHaveBeenCalledTimes(LOGIN_LOOP_MAX_ATTEMPTS);
  });

  test('a burst of callers in one page load counts once', async () => {
    // The Apollo link asks for a token per GraphQL request, so an expiring
    // session brings every in-flight query here at once. Counting each would
    // trip the breaker on an ordinary re-login.
    const auth0 = makeAuth0Client();
    const manager = makeManager(auth0);

    await Promise.all(Array.from({ length: LOGIN_LOOP_MAX_ATTEMPTS * 3 }, () => manager.login({})));

    // Still one page load's worth of budget spent, so the next one is fine.
    simulatePageLoad();
    await expect(manager.login({})).resolves.toBeUndefined();
  });

  test('confirming a session lets logins resume', async () => {
    const auth0 = makeAuth0Client();
    const manager = makeManager(auth0);

    for (let i = 0; i < LOGIN_LOOP_MAX_ATTEMPTS; i++) {
      simulatePageLoad();
      await manager.login({});
    }
    manager.confirmSessionEstablished();

    await expect(manager.login({})).resolves.toBeUndefined();
  });
});

describe('logout', () => {
  test('passes openUrl through so callers can skip the navigation', async () => {
    const auth0 = makeAuth0Client();

    await makeManager(auth0).logout({ openUrl: false });

    expect(auth0.logout).toHaveBeenCalledWith(expect.objectContaining({ openUrl: false }));
  });

  test('omits openUrl when not asked for', async () => {
    const auth0 = makeAuth0Client();

    await makeManager(auth0).logout({ returnTo: 'https://example.com' });

    expect(auth0.logout).toHaveBeenCalledWith({
      logoutParams: { returnTo: 'https://example.com' }
    });
  });

  test('does not reset the loop counter', async () => {
    // logout-then-login is itself one of the loops being guarded against, so a
    // logout must not hand back a fresh budget of redirects.
    const auth0 = makeAuth0Client();
    const manager = makeManager(auth0);

    for (let i = 0; i < LOGIN_LOOP_MAX_ATTEMPTS; i++) {
      simulatePageLoad();
      await manager.login({});
    }
    await manager.logout({ openUrl: false });

    simulatePageLoad();
    await expect(manager.login({})).rejects.toThrow(LoginLoopError);
  });
});

describe('probeSession', () => {
  test('reports an established session', async () => {
    await expect(makeManager(makeAuth0Client()).probeSession()).resolves.toEqual({
      status: 'authenticated'
    });
  });

  test('reports login_required as definitively unauthenticated', async () => {
    const auth0 = makeAuth0Client({
      checkSession: vi.fn().mockRejectedValue(auth0Error('login_required'))
    });

    await expect(makeManager(auth0).probeSession()).resolves.toEqual({
      status: 'unauthenticated'
    });
  });

  test('reports a blocked silent-auth iframe as indeterminate', async () => {
    // Reporting this as "unauthenticated" is what let autoLogin redirect,
    // succeed at Auth0, come back, and fail here again — the loop.
    const auth0 = makeAuth0Client({
      checkSession: vi.fn().mockRejectedValue(auth0Error('timeout', 'Timeout'))
    });

    const probe = await makeManager(auth0).probeSession();

    expect(probe.status).toBe('indeterminate');
  });

  test('reports an org mismatch as indeterminate', async () => {
    const auth0 = makeAuth0Client({
      checkSession: vi.fn().mockRejectedValue(auth0Error('access_denied', 'is not part of the org'))
    });

    const probe = await makeManager(auth0).probeSession();

    expect(probe.status).toBe('indeterminate');
  });

  test('reports no session when Auth0 succeeds but reports unauthenticated', async () => {
    const auth0 = makeAuth0Client({
      isAuthenticated: vi.fn().mockResolvedValue(false)
    });

    await expect(makeManager(auth0).probeSession()).resolves.toEqual({
      status: 'unauthenticated'
    });
  });
});
