import { PhotonClient } from '@photonhealth/sdk';
import { vi } from 'vitest';
import { DISPENSE_UNIT, PATIENT } from './msw-handlers';

/**
 * Creates a PhotonClient for testing.
 *
 * - apolloClinical: real fetch -  intercepted by MSW
 * - apollo: real fetch - intercepted by MSW
 *   watchQuery overridden (Observable pattern doesn't resolve with MSW in jsdom)
 * - auth: getAccessToken stubbed to skip Auth0
 */
export function createTestClient() {
  const client = new PhotonClient({ clientId: 'test-client-id', env: 'tau' });
  client.authentication.getAccessToken = vi.fn(async () => 'test-token');

  // watchQuery returns an Observable, not a fetch — MSW can't intercept it.
  // Override on both apollo clients; query/mutate still go through real HttpLink → MSW.
  mockWatchQuery(client.apollo, {
    patient: { id: PATIENT.id, name: { full: PATIENT.name.full }, orders: [] }
  });
  mockWatchQuery(client.apolloClinical, {
    // services clinical API include treatmentHistory resource
    patient: { id: PATIENT.id, treatmentHistory: [] }
  });

  return client;
}

/**
 * Creates a plain object matching the PhotonClientStore shape for PhotonContext.Provider.
 *
 * We can't use the real PhotonClientStore because its constructor initializes auth state
 * as { isAuthenticated: false, isLoading: true } and only updates via checkSession(),
 * which calls Auth0. Components like PhotonAuthorized gate on these values, so we need
 * them pre-set to authenticated. The real store also doesn't expose setStore publicly,
 * so there's no way to override auth state after construction.
 *
 * Network calls triggered by store methods (getDispenseUnits, etc.) are handled by MSW,
 * but the initial auth/loading state must be set here.
 */
export function createTestClientStore(client: PhotonClient) {
  return {
    sdk: client,
    getSDK: () => client,
    autoLogin: false,
    authentication: {
      state: {
        isAuthenticated: true,
        isLoading: false,
        isInOrg: true,
        permissions: ['read:patient', 'write:prescription'],
        error: undefined
      },
      login: vi.fn(),
      logout: vi.fn(),
      handleRedirect: vi.fn(),
      checkSession: vi.fn()
    },
    clinical: {
      dispenseUnits: {
        state: {
          isLoading: false,
          dispenseUnits: [DISPENSE_UNIT]
        },
        getDispenseUnits: vi.fn()
      }
    }
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mockWatchQuery(apolloClient: any, defaultData: Record<string, unknown>) {
  apolloClient.watchQuery = vi.fn(() => ({
    subscribe: ({ next }: { next: (value: { data: Record<string, unknown> }) => void }) => {
      queueMicrotask(() => next({ data: defaultData }));
      return { unsubscribe: () => undefined };
    }
  }));
}
