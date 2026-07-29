import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { PhotonClient } from '@photonhealth/sdk';
import { hasOrgLoginBeenAttempted, markOrgLoginAttempted } from '@photonhealth/sdk';
import { ORG_LOGIN_FAILED_MESSAGE, PhotonClientStore, SESSION_UNVERIFIABLE_MESSAGE } from './store';

const { jwtDecodeMock } = vi.hoisted(() => ({ jwtDecodeMock: vi.fn() }));
vi.mock('jwt-decode', () => ({ default: jwtDecodeMock }));

const CLIENT_ID = 'test-client';
const ASSIGNED_ORG = 'org_assigned';

type SdkOverrides = {
  organization?: string;
  probeSession?: ReturnType<typeof vi.fn>;
  getUser?: ReturnType<typeof vi.fn>;
  getAccessToken?: ReturnType<typeof vi.fn>;
  login?: ReturnType<typeof vi.fn>;
};

function makeSdk(overrides: SdkOverrides = {}) {
  const sdk = {
    clientId: CLIENT_ID,
    organization: overrides.organization,
    setOrganization: vi.fn((orgId: string) => {
      sdk.organization = orgId;
      return sdk;
    }),
    authentication: {
      probeSession:
        overrides.probeSession ?? vi.fn().mockResolvedValue({ status: 'authenticated' }),
      getUser: overrides.getUser ?? vi.fn().mockResolvedValue({ sub: 'auth0|usr_1' }),
      getAccessToken: overrides.getAccessToken ?? vi.fn().mockResolvedValue('a-token'),
      confirmSessionEstablished: vi.fn(),
      login: overrides.login ?? vi.fn().mockResolvedValue(undefined),
      logout: vi.fn().mockResolvedValue(undefined),
      handleRedirect: vi.fn().mockResolvedValue({}),
      checkSession: vi.fn().mockResolvedValue(undefined)
    }
  };
  return sdk as unknown as PhotonClient & typeof sdk;
}

beforeEach(() => {
  window.sessionStorage.clear();
  jwtDecodeMock.mockReset();
  jwtDecodeMock.mockReturnValue({ permissions: [] });
});

describe('checkSession — session verdicts', () => {
  test('an established session clears loading and error', async () => {
    const sdk = makeSdk();
    const store = new PhotonClientStore(sdk, true);

    await store.authentication.checkSession();

    expect(store.authentication.state.isAuthenticated).toBe(true);
    expect(store.authentication.state.isLoading).toBe(false);
    expect(store.authentication.state.error).toBeUndefined();
  });

  test('an indeterminate session surfaces an error instead of reading as logged out', async () => {
    // This is the loop: reported as logged out, autoLogin redirects, Auth0
    // succeeds, we come back and fail here again.
    const sdk = makeSdk({
      probeSession: vi
        .fn()
        .mockResolvedValue({ status: 'indeterminate', error: new Error('Timeout') })
    });
    const store = new PhotonClientStore(sdk, true);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await store.authentication.checkSession();

    expect(store.authentication.state.error).toBe(SESSION_UNVERIFIABLE_MESSAGE);
    expect(store.authentication.state.isLoading).toBe(false);
    expect(store.authentication.state.isAuthenticated).toBe(false);
  });

  test('a genuinely absent session stays error-free so autoLogin can proceed', async () => {
    const sdk = makeSdk({
      probeSession: vi.fn().mockResolvedValue({ status: 'unauthenticated' }),
      getUser: vi.fn().mockResolvedValue(undefined)
    });
    const store = new PhotonClientStore(sdk, true);

    await store.authentication.checkSession();

    expect(store.authentication.state.isAuthenticated).toBe(false);
    expect(store.authentication.state.error).toBeUndefined();
    expect(store.authentication.state.isLoading).toBe(false);
  });

  test('never redirects while fetching a token, since this also runs on a poll', async () => {
    const getAccessToken = vi.fn().mockResolvedValue('a-token');
    const store = new PhotonClientStore(makeSdk({ getAccessToken }), true);

    await store.authentication.checkSession();

    expect(getAccessToken).toHaveBeenCalledWith({ redirectOnFailure: false });
  });

  test('confirms the session only once it has actually been read', async () => {
    const sdk = makeSdk();
    const store = new PhotonClientStore(sdk, true);

    await store.authentication.checkSession();

    expect(sdk.authentication.confirmSessionEstablished).toHaveBeenCalled();
  });

  test('does not confirm a session it could not verify', async () => {
    const sdk = makeSdk({
      probeSession: vi
        .fn()
        .mockResolvedValue({ status: 'indeterminate', error: new Error('Timeout') })
    });
    const store = new PhotonClientStore(sdk, true);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await store.authentication.checkSession();

    expect(sdk.authentication.confirmSessionEstablished).not.toHaveBeenCalled();
  });
});

describe('checkSession — claim-assisted org login', () => {
  beforeEach(() => {
    jwtDecodeMock.mockReturnValue({
      permissions: [],
      'https://photon.health/assigned_org_id': ASSIGNED_ORG
    });
  });

  test('re-logs in scoped to the assigned org the first time', async () => {
    const login = vi.fn().mockResolvedValue(undefined);
    const sdk = makeSdk({ login, getUser: vi.fn().mockResolvedValue({ sub: 'auth0|usr_1' }) });
    const store = new PhotonClientStore(sdk, true);

    await store.authentication.checkSession();

    expect(sdk.setOrganization).toHaveBeenCalledWith(ASSIGNED_ORG);
    expect(login).toHaveBeenCalledTimes(1);
    expect(hasOrgLoginBeenAttempted(CLIENT_ID, ASSIGNED_ORG)).toBe(true);
  });

  test('does not ask a second time when the org claim never arrives', async () => {
    // The redirect already happened once and came back without an org_id, so
    // asking again is the loop.
    markOrgLoginAttempted(CLIENT_ID, ASSIGNED_ORG);
    const login = vi.fn().mockResolvedValue(undefined);
    const sdk = makeSdk({ login });
    const store = new PhotonClientStore(sdk, true);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await store.authentication.checkSession();

    expect(login).not.toHaveBeenCalled();
    expect(store.authentication.state.error).toBe(ORG_LOGIN_FAILED_MESSAGE);
    expect(store.authentication.state.isLoading).toBe(false);
  });

  test('skips the re-login when the user already carries an org', async () => {
    const login = vi.fn().mockResolvedValue(undefined);
    const sdk = makeSdk({
      login,
      getUser: vi.fn().mockResolvedValue({ sub: 'auth0|usr_1', org_id: 'org_existing' })
    });
    const store = new PhotonClientStore(sdk, true);

    await store.authentication.checkSession();

    expect(login).not.toHaveBeenCalled();
    expect(store.authentication.state.isInOrg).toBe(true);
  });

  test('skips the re-login when an org was configured upfront', async () => {
    const login = vi.fn().mockResolvedValue(undefined);
    const sdk = makeSdk({ login, organization: 'org_configured' });
    const store = new PhotonClientStore(sdk, true);

    await store.authentication.checkSession();

    expect(login).not.toHaveBeenCalled();
  });
});

describe('login', () => {
  test('surfaces a tripped loop breaker instead of redirecting again', async () => {
    const loopError = Object.assign(new Error('too many redirects'), {
      name: 'LoginLoopError'
    });
    const sdk = makeSdk({ login: vi.fn().mockRejectedValue(loopError) });
    const store = new PhotonClientStore(sdk, true);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await store.authentication.login({});

    expect(store.authentication.state.error).toBeTruthy();
    expect(store.authentication.state.isLoading).toBe(false);
    // A refused login must not go on to re-check the session as if it worked.
    expect(sdk.authentication.probeSession).not.toHaveBeenCalled();
  });

  test('checks the session after a login that actually started', async () => {
    const sdk = makeSdk();
    const store = new PhotonClientStore(sdk, true);

    await store.authentication.login({});

    expect(sdk.authentication.probeSession).toHaveBeenCalled();
  });
});
