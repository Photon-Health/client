import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { PhotonClient } from '@photonhealth/sdk';
import { PhotonClientStore } from './store';

const { jwtDecodeMock } = vi.hoisted(() => ({ jwtDecodeMock: vi.fn() }));
vi.mock('jwt-decode', () => ({ default: jwtDecodeMock }));

/** A URL as left behind by a redirect whose code exchange failed. */
const STALE_URL = '/prescribe?patientId=pat_1&photon=true&code=spent_code&state=stale_state';

/** auth0-spa-js throws this when the state has no matching transaction. */
const invalidState = () => new Error('Invalid state');

type SdkOverrides = {
  handleRedirect?: ReturnType<typeof vi.fn>;
  isAuthenticated?: ReturnType<typeof vi.fn>;
  getUser?: ReturnType<typeof vi.fn>;
};

function makeSdk(overrides: SdkOverrides = {}) {
  const sdk = {
    organization: undefined as string | undefined,
    setOrganization: vi.fn((orgId: string) => {
      sdk.organization = orgId;
      return sdk;
    }),
    authentication: {
      handleRedirect: overrides.handleRedirect ?? vi.fn().mockResolvedValue({ appState: {} }),
      checkSession: vi.fn().mockResolvedValue(undefined),
      isAuthenticated: overrides.isAuthenticated ?? vi.fn().mockResolvedValue(true),
      getUser: overrides.getUser ?? vi.fn().mockResolvedValue({ sub: 'auth0|usr_1' }),
      getAccessToken: vi.fn().mockResolvedValue('a-token'),
      login: vi.fn().mockResolvedValue(undefined),
      logout: vi.fn().mockResolvedValue(undefined)
    }
  };
  return sdk as unknown as PhotonClient & typeof sdk;
}

beforeEach(() => {
  window.history.replaceState(null, '', STALE_URL);
  jwtDecodeMock.mockReset();
  jwtDecodeMock.mockReturnValue({ permissions: [] });
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('handleRedirect — failed code exchange', () => {
  test('settles isLoading so consumers do not spin forever', async () => {
    const store = new PhotonClientStore(
      makeSdk({ handleRedirect: vi.fn().mockRejectedValue(invalidState()) }),
      true
    );

    await store.authentication.handleRedirect();

    expect(store.authentication.state.isLoading).toBe(false);
  });

  test('clears the redirect params so the failure cannot be replayed', async () => {
    // Left in place, hasAuthParams() stays true and every subsequent load
    // re-enters this same failing exchange instead of checking the session.
    const store = new PhotonClientStore(
      makeSdk({ handleRedirect: vi.fn().mockRejectedValue(invalidState()) }),
      true
    );

    await store.authentication.handleRedirect();

    expect(window.location.search).not.toMatch(/code=|state=|photon=/);
  });

  test('keeps the host app own query params', async () => {
    const store = new PhotonClientStore(
      makeSdk({ handleRedirect: vi.fn().mockRejectedValue(invalidState()) }),
      true
    );

    await store.authentication.handleRedirect();

    expect(window.location.search).toContain('patientId=pat_1');
  });

  test('recovers into the session that was there all along', async () => {
    // This is what deleting the params by hand achieved.
    const sdk = makeSdk({ handleRedirect: vi.fn().mockRejectedValue(invalidState()) });
    const store = new PhotonClientStore(sdk, true);

    await store.authentication.handleRedirect();

    expect(sdk.authentication.isAuthenticated).toHaveBeenCalled();
    expect(store.authentication.state.isAuthenticated).toBe(true);
  });

  test('does not surface an error when recovery succeeds', async () => {
    // Recovery must settle before any state is published: exposing
    // "not loading, not authenticated" mid-flight is a cue autoLogin consumers
    // act on, bouncing the user to Auth0 for no reason.
    const store = new PhotonClientStore(
      makeSdk({ handleRedirect: vi.fn().mockRejectedValue(invalidState()) }),
      true
    );

    await store.authentication.handleRedirect();

    expect(store.authentication.state.error).toBeUndefined();
  });

  test('surfaces the reason when recovery also fails', async () => {
    const store = new PhotonClientStore(
      makeSdk({
        handleRedirect: vi.fn().mockRejectedValue(invalidState()),
        isAuthenticated: vi.fn().mockResolvedValue(false),
        getUser: vi.fn().mockResolvedValue(undefined)
      }),
      true
    );

    await store.authentication.handleRedirect();

    expect(store.authentication.state.error).toMatch(/Invalid state/);
    expect(store.authentication.state.isLoading).toBe(false);
  });

  test('reports that the exchange did not succeed', async () => {
    const store = new PhotonClientStore(
      makeSdk({ handleRedirect: vi.fn().mockRejectedValue(invalidState()) }),
      true
    );

    await expect(store.authentication.handleRedirect()).resolves.toBe(false);
  });

  test('settles isLoading on an invalid organization id too', async () => {
    const store = new PhotonClientStore(
      makeSdk({
        handleRedirect: vi
          .fn()
          .mockRejectedValue(new Error('organization must be an organization id'))
      }),
      true
    );

    await store.authentication.handleRedirect();

    expect(store.authentication.state.isLoading).toBe(false);
    expect(store.authentication.state.error).toMatch(/organization id/);
  });

  test('keeps a genuine authorization failure terminal', async () => {
    // Not something a session re-check should paper over.
    window.history.replaceState(
      null,
      '',
      `${STALE_URL}&error_description=user+is+not+part+of+the+org`
    );
    const sdk = makeSdk({ handleRedirect: vi.fn().mockRejectedValue(new Error('Unauthorized')) });
    const store = new PhotonClientStore(sdk, true);

    await store.authentication.handleRedirect();

    expect(store.authentication.state.error).toBe('User is not authorized');
    expect(store.authentication.state.isLoading).toBe(false);
    expect(sdk.authentication.isAuthenticated).not.toHaveBeenCalled();
  });
});

describe('handleRedirect — successful code exchange', () => {
  test('reports success', async () => {
    const store = new PhotonClientStore(makeSdk(), true);

    await expect(store.authentication.handleRedirect()).resolves.toBe(true);
  });

  test('clears the redirect params', async () => {
    const store = new PhotonClientStore(makeSdk(), true);

    await store.authentication.handleRedirect();

    expect(window.location.search).not.toMatch(/code=|state=|photon=/);
    expect(window.location.search).toContain('patientId=pat_1');
  });

  test('does not leave the spent URL reachable via Back', async () => {
    const historyLength = window.history.length;
    const store = new PhotonClientStore(makeSdk(), true);

    await store.authentication.handleRedirect();

    // replaceState, not pushState — otherwise Back returns to the spent code.
    expect(window.history.length).toBe(historyLength);
  });
});
