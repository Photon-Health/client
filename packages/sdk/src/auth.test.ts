import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { Auth0Client } from '@auth0/auth0-spa-js';
import { AuthManager, LoginLoopError, stripAuthParams } from './auth';

function makeAuth0Client(overrides: Partial<Auth0Client> = {}) {
  return {
    getTokenSilently: vi.fn().mockResolvedValue('a-token'),
    getTokenWithPopup: vi.fn().mockResolvedValue('a-popup-token'),
    loginWithRedirect: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn().mockResolvedValue(undefined),
    checkSession: vi.fn().mockResolvedValue(undefined),
    isAuthenticated: vi.fn().mockResolvedValue(true),
    getUser: vi.fn().mockResolvedValue({ sub: 'auth0|usr_1' }),
    handleRedirectCallback: vi.fn().mockResolvedValue({ appState: {} }),
    ...overrides
  } as unknown as Auth0Client;
}

function makeManager(auth0: Auth0Client) {
  return new AuthManager({
    authentication: auth0,
    audience: 'https://api.photon.health'
  });
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('stripAuthParams', () => {
  test('removes the params an Auth0 redirect leaves behind', () => {
    expect(stripAuthParams('?code=abc&state=xyz&photon=true')).toBe('');
  });

  test('keeps the host app own params', () => {
    expect(stripAuthParams('?patientId=pat_1&code=abc&state=xyz')).toBe('?patientId=pat_1');
  });

  test('removes the params an aborted login leaves behind', () => {
    expect(stripAuthParams('?error=access_denied&error_description=nope&state=xyz')).toBe('');
  });

  test('handles an empty search string', () => {
    expect(stripAuthParams('')).toBe('');
  });

  test('leaves a query string with nothing to strip alone', () => {
    expect(stripAuthParams('?patientId=pat_1')).toBe('?patientId=pat_1');
  });
});

describe('handleRedirect', () => {
  test('returns the exchange result', async () => {
    const auth0 = makeAuth0Client({
      handleRedirectCallback: vi.fn().mockResolvedValue({ appState: { returnTo: '/somewhere' } })
    });

    await expect(makeManager(auth0).handleRedirect()).resolves.toEqual({
      appState: { returnTo: '/somewhere' }
    });
  });

  test('propagates a failed exchange to the caller', async () => {
    // The try/catch used to wrap an un-awaited return, so a rejection escaped
    // it entirely: nothing was logged and callers got an opaque rejection.
    const auth0 = makeAuth0Client({
      handleRedirectCallback: vi.fn().mockRejectedValue(new Error('Invalid state'))
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(makeManager(auth0).handleRedirect()).rejects.toThrow('Invalid state');
  });

  test('logs the reason a redirect could not be completed', async () => {
    const auth0 = makeAuth0Client({
      handleRedirectCallback: vi.fn().mockRejectedValue(new Error('Invalid state'))
    });
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(makeManager(auth0).handleRedirect()).rejects.toThrow();

    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining('Failed to complete the Auth0 redirect'),
      expect.any(Error)
    );
  });
});

/** auth0-spa-js rejects like this when the silent iframe gets no session. */
const loginRequired = () => vi.fn().mockRejectedValue(new Error('Login required'));

describe('login redirects', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  test('a failed silent auth redirects once and does not retry', async () => {
    // The old retry ran a second silent auth and a second loginWithRedirect
    // while the first redirect was still navigating.
    const auth0 = makeAuth0Client({ getTokenSilently: loginRequired() });

    await expect(makeManager(auth0).getAccessToken()).rejects.toThrow(
      'Unable to retrieve access token'
    );

    expect(auth0.getTokenSilently).toHaveBeenCalledTimes(1);
    expect(auth0.loginWithRedirect).toHaveBeenCalledTimes(1);
  });

  test('concurrent token requests share one redirect', async () => {
    // Each extra loginWithRedirect overwrites the stored transaction, so the
    // callback fails "Invalid state" and the code is never exchanged.
    const auth0 = makeAuth0Client({ getTokenSilently: loginRequired() });
    const manager = makeManager(auth0);

    await Promise.allSettled([manager.getAccessToken(), manager.getAccessToken()]);

    expect(auth0.loginWithRedirect).toHaveBeenCalledTimes(1);
  });

  test('an explicit login joins a redirect already under way', async () => {
    const auth0 = makeAuth0Client({ getTokenSilently: loginRequired() });
    const manager = makeManager(auth0);

    await Promise.allSettled([manager.getAccessToken(), manager.login({})]);

    expect(auth0.loginWithRedirect).toHaveBeenCalledTimes(1);
  });

  test('managers around the same client share one redirect', async () => {
    // setOrganization and clearOrganization build new managers on one client.
    const auth0 = makeAuth0Client();

    await Promise.all([makeManager(auth0).login({}), makeManager(auth0).login({})]);

    expect(auth0.loginWithRedirect).toHaveBeenCalledTimes(1);
  });

  test('a redirect that fails to start does not block the next login', async () => {
    const auth0 = makeAuth0Client({
      loginWithRedirect: vi
        .fn()
        .mockRejectedValueOnce(new Error('organization must be an organization id'))
        .mockResolvedValue(undefined)
    });
    const manager = makeManager(auth0);

    await expect(manager.login({})).rejects.toThrow('organization');
    await manager.login({});

    expect(auth0.loginWithRedirect).toHaveBeenCalledTimes(2);
  });
});

describe('login loop breaker', () => {
  // Each Auth0 client stands in for one page load: the in-flight redirect is
  // per page, the record of past attempts survives in sessionStorage.
  const pageLoad = (overrides: Partial<Auth0Client> = {}) =>
    makeAuth0Client({ getTokenSilently: loginRequired(), ...overrides });

  beforeEach(() => {
    window.sessionStorage.clear();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-23T14:36:00Z'));
    return () => {
      vi.useRealTimers();
    };
  });

  test('does not redirect again right after a redirect came back empty', async () => {
    await makeManager(pageLoad())
      .getAccessToken()
      .catch(() => {});
    vi.advanceTimersByTime(4_000);

    const auth0 = pageLoad();
    await expect(makeManager(auth0).getAccessToken()).rejects.toBeInstanceOf(LoginLoopError);

    expect(auth0.loginWithRedirect).not.toHaveBeenCalled();
  });

  test('keeps automatic redirects off past the loop window', async () => {
    // Elements re-checks the session every 60s; that must not restart the loop.
    await makeManager(pageLoad())
      .getAccessToken()
      .catch(() => {});
    vi.advanceTimersByTime(4_000);
    await makeManager(pageLoad())
      .getAccessToken()
      .catch(() => {});
    vi.advanceTimersByTime(60_000);

    const auth0 = pageLoad();
    await expect(makeManager(auth0).getAccessToken()).rejects.toBeInstanceOf(LoginLoopError);

    expect(auth0.loginWithRedirect).not.toHaveBeenCalled();
  });

  test('redirects again once the backoff has passed', async () => {
    await makeManager(pageLoad())
      .getAccessToken()
      .catch(() => {});
    vi.advanceTimersByTime(4_000);
    await makeManager(pageLoad())
      .getAccessToken()
      .catch(() => {});
    vi.advanceTimersByTime(11 * 60_000);

    const auth0 = pageLoad();
    await makeManager(auth0)
      .getAccessToken()
      .catch(() => {});

    expect(auth0.loginWithRedirect).toHaveBeenCalledTimes(1);
  });

  test('a redirect long after the last one is not a loop', async () => {
    await makeManager(pageLoad())
      .getAccessToken()
      .catch(() => {});
    vi.advanceTimersByTime(31_000);

    const auth0 = pageLoad();
    await makeManager(auth0)
      .getAccessToken()
      .catch(() => {});

    expect(auth0.loginWithRedirect).toHaveBeenCalledTimes(1);
  });

  test('never blocks an explicit login', async () => {
    await makeManager(pageLoad())
      .getAccessToken()
      .catch(() => {});
    vi.advanceTimersByTime(4_000);
    await makeManager(pageLoad())
      .getAccessToken()
      .catch(() => {});

    const auth0 = pageLoad();
    await makeManager(auth0).login({});

    expect(auth0.loginWithRedirect).toHaveBeenCalledTimes(1);
  });

  test('a token resets it', async () => {
    await makeManager(pageLoad())
      .getAccessToken()
      .catch(() => {});
    await makeManager(makeAuth0Client()).getAccessToken();

    const auth0 = pageLoad();
    await makeManager(auth0)
      .getAccessToken()
      .catch(() => {});

    expect(auth0.loginWithRedirect).toHaveBeenCalledTimes(1);
  });

  test('a completed redirect resets it', async () => {
    await makeManager(pageLoad())
      .getAccessToken()
      .catch(() => {});
    await makeManager(makeAuth0Client()).handleRedirect();

    const auth0 = pageLoad();
    await makeManager(auth0)
      .getAccessToken()
      .catch(() => {});

    expect(auth0.loginWithRedirect).toHaveBeenCalledTimes(1);
  });

  test('a logout resets it', async () => {
    await makeManager(pageLoad())
      .getAccessToken()
      .catch(() => {});
    await makeManager(makeAuth0Client()).logout({});

    const auth0 = pageLoad();
    await makeManager(auth0)
      .getAccessToken()
      .catch(() => {});

    expect(auth0.loginWithRedirect).toHaveBeenCalledTimes(1);
  });

  test('without sessionStorage it redirects as before', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });

    await makeManager(pageLoad())
      .getAccessToken()
      .catch(() => {});
    const auth0 = pageLoad();
    await makeManager(auth0)
      .getAccessToken()
      .catch(() => {});

    expect(auth0.loginWithRedirect).toHaveBeenCalledTimes(1);
  });
});
