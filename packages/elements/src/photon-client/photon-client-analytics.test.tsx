import { vi } from 'vitest';
import { stubGoogleMaps } from '../test-utils/stub-google-maps';
import { cleanup, waitFor } from '@solidjs/testing-library';
import { setupServer } from 'msw/node';
import { clinicalGql, defaultHandlers, ORGANIZATION, PROVIDER } from '@photonhealth/sdk/test-utils';
import { http, HttpResponse } from 'msw';
import { renderPhotonClient } from './test-utils/test-element-setup';

vi.mock('solid-element', () => ({
  customElement: vi.fn()
}));

// AnalyticsClient.track() requires a valid access token, so these stubs
// simulate a logged-in session.
vi.mock('@auth0/auth0-spa-js', () => ({
  Auth0Client: class {
    checkSession = vi.fn().mockResolvedValue(undefined);
    isAuthenticated = vi.fn().mockResolvedValue(true);
    getUser = vi.fn().mockResolvedValue({ sub: 'auth0|usr_testId1111' });
    getTokenSilently = vi.fn().mockResolvedValue('test-access-token');
    getTokenWithPopup = vi.fn().mockResolvedValue('test-access-token');
    loginWithRedirect = vi.fn().mockResolvedValue(undefined);
    handleRedirectCallback = vi.fn().mockResolvedValue({});
    logout = vi.fn().mockResolvedValue(undefined);
  }
}));

const server = setupServer(...defaultHandlers);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });

  stubGoogleMaps();
});

afterEach(async () => {
  cleanup();
  server.resetHandlers();
  vi.clearAllMocks();
});

afterAll(() => server.close());

test('sends a photon-analytics-track-event to the analytics API', async () => {
  const analyticsTrackSpy = vi.fn();
  const analyticsContextQuerySpy = vi.fn();
  const orderWorkflowId = 'test-order-workflow-id';

  server.use(
    http.post('http://analytics-api.tau.health:8080/event', async ({ request }) => {
      analyticsTrackSpy(await request.json());
      return HttpResponse.json({ status: 'ok' });
    }),
    clinicalGql.query('AnalyticsContextQuery', () => {
      analyticsContextQuerySpy();
      return HttpResponse.json({
        data: { me: { ...PROVIDER, roles: [] }, organization: ORGANIZATION }
      });
    })
  );

  const { rootElement } = renderPhotonClient({ appAnalyticsProperties: { orderWorkflowId } });

  // Context needed to build analytics event
  await waitFor(() => {
    expect(analyticsContextQuerySpy).toHaveBeenCalled();
  });

  await waitFor(() => {
    rootElement.dispatchEvent(
      new CustomEvent('photon-analytics-track-event', {
        bubbles: true,
        composed: true,
        detail: {
          category: 'ctaClicked',
          name: 'Order Sent',
          timestamp: new Date().toISOString()
        }
      })
    );
    expect(analyticsTrackSpy).toHaveBeenCalledWith({
      event: 'Order Sent',
      userId: PROVIDER.id,
      properties: {
        providerId: PROVIDER.id,
        providerEmail: PROVIDER.email,
        providerName: PROVIDER.name.full,
        providerNameFirst: PROVIDER.name.first,
        providerNameLast: PROVIDER.name.last,
        providerRoles: [],
        orgId: ORGANIZATION.id,
        orgName: ORGANIZATION.name,
        customerId: ORGANIZATION.customer.id,
        customerName: ORGANIZATION.customer.name,
        category: 'ctaClicked',
        timestamp: expect.any(String),
        environment: 'tau',
        sdkVersion: expect.any(String),
        elementsVersion: expect.any(String),
        orderWorkflowId
      }
    });
  });
});

test('fails silently when the analytics API request fails', async () => {
  const analyticsContextQuerySpy = vi.fn();
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  server.use(
    http.post('http://analytics-api.tau.health:8080/event', () => HttpResponse.error()),
    clinicalGql.query('AnalyticsContextQuery', () => {
      analyticsContextQuerySpy();
      return HttpResponse.json({
        data: { me: { ...PROVIDER, roles: [] }, organization: ORGANIZATION }
      });
    })
  );

  const { rootElement } = renderPhotonClient();

  // Context needed to build analytics event
  await waitFor(() => {
    expect(analyticsContextQuerySpy).toHaveBeenCalled();
  });

  expect(() => {
    rootElement.dispatchEvent(
      new CustomEvent('photon-analytics-track-event', {
        bubbles: true,
        composed: true,
        detail: {
          category: 'ctaClicked',
          name: 'Order Sent',
          timestamp: new Date().toISOString()
        }
      })
    );
  }).not.toThrow();

  // The failed request is caught and logged rather than thrown/unhandled
  await waitFor(() => {
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  consoleErrorSpy.mockRestore();
});
