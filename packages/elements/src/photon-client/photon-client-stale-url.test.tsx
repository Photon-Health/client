import { beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, waitFor } from '@solidjs/testing-library';
import { setupServer } from 'msw/node';
import { defaultHandlers } from '@photonhealth/sdk/test-utils';
import { stubGoogleMaps } from '../test-utils/stub-google-maps';
import { renderPhotonClient } from './test-utils/test-element-setup';

const STALE_SEARCH = '?patientId=pat_1&photon=true&code=spent&state=stale';

vi.mock('solid-element', () => ({ customElement: vi.fn() }));

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
  window.history.replaceState(null, '', `/prescribe${STALE_SEARCH}`);
  auth0.checkSession.mockResolvedValue(undefined);
  auth0.isAuthenticated.mockResolvedValue(true);
  auth0.getUser.mockResolvedValue({ sub: 'auth0|usr_testId1111' });
  auth0.getTokenSilently.mockResolvedValue('test-access-token');
  auth0.getTokenWithPopup.mockResolvedValue('test-access-token');
  auth0.loginWithRedirect.mockResolvedValue(undefined);
  auth0.logout.mockResolvedValue(undefined);
  // The stale code cannot be considered valid.
  auth0.handleRedirectCallback.mockRejectedValue(new Error('Invalid state'));
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  vi.clearAllMocks();
  window.history.replaceState(null, '', '/');
});

afterAll(() => server.close());

describe('a stale URL from a failed code exchange', () => {
  test('strips the spent params so the next load can check the session', async () => {
    renderPhotonClient({ id: 'test-client', autoLogin: true });

    await waitFor(() => {
      expect(window.location.search).not.toContain('code=');
    });

    expect(window.location.search).not.toMatch(/state=|photon=/);
  });

  test('does not take the host app own params with it', async () => {
    renderPhotonClient({ id: 'test-client', autoLogin: true });

    await waitFor(() => {
      expect(window.location.search).not.toContain('code=');
    });

    expect(window.location.search).toContain('patientId=pat_1');
  });

  test('recovers into the session instead of hanging on loading', async () => {
    renderPhotonClient({ id: 'test-client', autoLogin: true });

    await waitFor(() => {
      expect(auth0.getTokenSilently).toHaveBeenCalled();
    });

    // Picked the session up rather than bouncing to Auth0 again.
    expect(auth0.loginWithRedirect).not.toHaveBeenCalled();
  });

  test('attempts the exchange only once', async () => {
    renderPhotonClient({ id: 'test-client', autoLogin: true });

    await waitFor(() => {
      expect(auth0.handleRedirectCallback).toHaveBeenCalled();
    });
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(auth0.handleRedirectCallback).toHaveBeenCalledTimes(1);
  });
});
