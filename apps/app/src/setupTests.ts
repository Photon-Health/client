import '@testing-library/jest-dom';
import { randomUUID } from 'node:crypto';
import { PhotonClient } from '@photonhealth/sdk';
import { vi } from 'vitest';

// Auth0 fix to get tests passing. This gets around the 'auth0-spa-js must run on a secure origin' error
// More info https://github.com/auth0/auth0-spa-js/blob/master/FAQ.md#why-do-you-get-auth0-spa-js-must-run-on-a-secure-origin
Object.defineProperty(window, 'crypto', {
  value: { subtle: {}, randomUUID },
  writable: true,
  configurable: true
});

// Datadog RUM does not initialize in jsdom
vi.mock('@datadog/browser-rum', () => ({
  datadogRum: { addAction: vi.fn(), init: vi.fn(), setUser: vi.fn() }
}));

// @client/settings reads VITE_ENV_NAME at module scope — undefined in CI
vi.mock('@client/settings', () => ({
  getOrgMailOrderPharms: vi.fn(() => undefined)
}));

// Datadog instrumentation context setter — no-op in tests
vi.mock('./instrumentation/setInstrumentationUserContext', () => ({
  setInstrumentationUserContext: vi.fn()
}));

// ---------------------------------------------------------------------------
// Shared test-harness state
// ---------------------------------------------------------------------------
// Lives here (not in `./test-utils/harness`) so the global `vi.mock` factories
// below can read it without triggering an import cycle. `harness.tsx`
// statically imports `useProviderAnalytics`, which imports `@photonhealth/
// react` — the very module being mocked. If the mock factory dynamically
// imported `harness.tsx`, the mocked module would resolve to a partial
// namespace and Apollo queries would hang. Keeping the state in this file
// (which has no app imports) avoids that cycle.
//
// `harness.tsx` re-imports `harness` from here for its `setupHarness` /
// `renderWithProviders` helpers, so tests still access everything through
// the `test-utils` barrel.

type MockUser = { org_id?: string } | null;

const photonClient = new PhotonClient({ clientId: 'test', env: 'tau' });
photonClient.authentication.getAccessToken = vi.fn(async () => 'test-token');

export const DEFAULT_USER: MockUser = { org_id: 'org_1' };

export const harness: {
  photonClient: PhotonClient;
  user: MockUser;
  isAuthenticated: boolean;
  isLoading: boolean;
  trackSpy: ReturnType<typeof vi.fn>;
  identifySpy: ReturnType<typeof vi.fn>;
} = {
  photonClient,
  // Mocked usePhoton return — mutable so tests can adjust auth/user state.
  user: DEFAULT_USER,
  isAuthenticated: true,
  isLoading: false,
  // Spies are mutable references (not replaced) so captured references in
  // the vi.mock factories stay valid across tests; `.mockClear()` rather
  // than reassign.
  trackSpy: vi.fn(),
  identifySpy: vi.fn()
};

// Sync vi.mock factories that read directly from the module-scope `harness`.
// No dynamic import → no cycle.
vi.mock('@photonhealth/react', () => ({
  usePhoton: () => ({
    isAuthenticated: harness.isAuthenticated,
    isLoading: harness.isLoading,
    user: harness.user,
    clinicalClient: harness.photonClient.apolloClinical,
    getToken: async () => 'test-token'
  })
}));

vi.mock('./configs/providerAnalytics', () => ({
  getProviderAnalytics: () => ({
    track: (...args: unknown[]) => harness.trackSpy(...args),
    identify: (...args: unknown[]) => harness.identifySpy(...args),
    isInitialized: true
  })
}));
