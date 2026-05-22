// Test harness for the clinical app. Exposes:
//   - the singleton `harness` state (photon client, mock-auth state, spies)
//   - `setupHarness(...)` — installs Vitest lifecycle hooks for state isolation
//   - `renderWithProviders(ui)` — wraps in Router + Chakra + Apollo + Analytics
//   - `dispatchCustomEvent` — composed/bubbles helper for web-component events
//
// The mutable `harness` object lives in `../setupTests.ts` to avoid circular deps
import { ApolloProvider } from '@apollo/client';
import { ChakraProvider } from '@chakra-ui/react';
import { defaultHandlers } from '@photonhealth/sdk/test-utils';
import { render } from '@testing-library/react';
import type { RequestHandler } from 'msw';
import { setupServer } from 'msw/node';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest';

import customTheme from '../configs/theme';
import { ProviderAnalyticsProvider } from '../hooks/useProviderAnalytics';
import { DEFAULT_USER, harness } from '../setupTests';

// Re-export so test files can import everything through the `test-utils` barrel.
export { harness } from '../setupTests';

/**
 * Install the test harness for the current spec file. Call once at module
 * scope. Returns the shared spies, photon client, MSW server, and renderer.
 *
 * Per-test isolation:
 *   - Apollo caches (lambdas + clinical) cleared before each test
 *   - `trackSpy`/`identifySpy` cleared before each test
 *   - Mutable `harness.user`/`isAuthenticated`/`isLoading` reset to defaults
 *   - MSW handlers reset after each test (use `server.use(...)` in a
 *     `beforeEach` block to add per-test handlers)
 *
 * @param initialHandlers Optional handlers added to the server in addition
 *   to the shared `defaultHandlers` from `@photonhealth/sdk/test-utils`.
 */
export function setupHarness(...initialHandlers: RequestHandler[]) {
  const server = setupServer(...defaultHandlers, ...initialHandlers);

  beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
  afterAll(() => server.close());

  beforeEach(async () => {
    await harness.photonClient.apollo.clearStore();
    await harness.photonClient.apolloClinical.clearStore();
    harness.trackSpy.mockClear();
    harness.identifySpy.mockClear();
    harness.user = DEFAULT_USER;
    harness.isAuthenticated = true;
    harness.isLoading = false;
  });

  afterEach(() => {
    server.resetHandlers();
  });

  return {
    server,
    photonClient: harness.photonClient,
    trackSpy: harness.trackSpy,
    identifySpy: harness.identifySpy,
    renderWithProviders
  };
}

/**
 * Render `ui` inside the standard clinical-app provider tree. Apollo's
 * default client is the lambdas client; the clinical client is reached via
 * the mocked `usePhoton().clinicalClient`. Pass `initialEntries` to seed the
 * `MemoryRouter` history when the rendered tree includes route-aware
 * components (e.g. a `<Routes>` block with `:param`s).
 */
export function renderWithProviders(
  ui: ReactNode,
  { initialEntries }: { initialEntries?: string[] } = {}
) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <ChakraProvider theme={customTheme}>
        <ApolloProvider client={harness.photonClient.apollo}>
          <ProviderAnalyticsProvider>{ui}</ProviderAnalyticsProvider>
        </ApolloProvider>
      </ChakraProvider>
    </MemoryRouter>
  );
}

/**
 * Convenience: dispatch a `composed: true, bubbles: true` CustomEvent on a
 * web-component element. Mirrors the way real Solid web components emit
 * events through Shadow DOM boundaries.
 */
export function dispatchCustomEvent<TDetail>(el: HTMLElement, type: string, detail: TDetail) {
  el.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail }));
}
