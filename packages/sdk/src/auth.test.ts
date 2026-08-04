import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { Auth0Client } from '@auth0/auth0-spa-js';
import { AuthManager, stripAuthParams } from './auth';

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
