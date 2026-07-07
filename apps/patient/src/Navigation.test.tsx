import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, vi } from 'vitest';
import { createMemoryRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import { OrderContextType } from './views/Main';
import {
  generateFill,
  generateFulfillment,
  generateOrder,
  generatePatient,
  generatePharmacy
} from './test-utils/generators';
import userEvent from '@testing-library/user-event';
import { routeElements } from './Routes';
import { FEATURE_FLAG_DEFAULTS } from './configs/featureFlags';
import { markAutoroutedPharmacyConfirmed } from './utils/autoroutedPharmacyConfirmationStorage';

const mockToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30';

const mockPatientAnalytics = {
  page: vi.fn(),
  identify: vi.fn(),
  track: vi.fn(),
  getFlagValue: vi.fn(),
  getFlagValueSync: vi.fn()
};
vi.mock('./configs/analytics', () => ({
  getPatientAnalytics: () => mockPatientAnalytics
}));

vi.mock('./api', () => ({
  geocode: vi.fn().mockResolvedValue({
    lat: 40.7128,
    lng: -74.006,
    address: '123 Main St, New York, NY 10001'
  }),
  getOrder: vi.fn(),
  getPharmacies: vi.fn().mockResolvedValue({ pharmacies: [] }),
  getPharmaciesByLocation: vi.fn().mockResolvedValue({ pharmaciesByLocation: [] }),
  getOfferBundles: vi.fn().mockResolvedValue([]),
  rerouteOrder: vi.fn(),
  setOrderPharmacy: vi.fn(),
  setPreferredPharmacy: vi.fn(),
  triggerDemoNotification: vi.fn(),
  AUTH_HEADER_ERRORS: []
}));

vi.mock('./configs/graphqlClient', () => ({
  setAuthHeader: vi.fn(),
  graphQLClient: {
    request: vi.fn().mockResolvedValue({})
  },
  gqlSerializer: {
    parse: vi.fn(),
    stringify: vi.fn()
  }
}));

vi.mock('./views/pharmacy.utils', () => ({
  fetchOfferBundles: vi.fn().mockResolvedValue([]),
  getPharmacy: vi.fn().mockReturnValue({
    type: 'PICKUP',
    selectedPharmacy: { id: 'phr_testId123', name: 'Test Local Pickup Pharmacy' }
  })
}));

vi.mock('react-ga4');
vi.mock('mixpanel-browser');

vi.mock('./components', async () => {
  const mod = await vi.importActual('./components');
  return {
    ...mod,
    FixedFooter: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="fixed-footer">{children}</div>
    ),
    LocationModal: () => <div data-testid="location-modal">Location Modal</div>,
    InsuranceModal: () => <div data-testid="insurance-modal">Insurance Modal</div>,
    PoweredBy: () => <div data-testid="powered-by">Powered By</div>,
    Nav: () => <div>Nav</div>,
    PrescriptionsList: () => <div>PrescriptionsList</div>
  };
});

describe('App', () => {
  const testOrder = generateOrder({
    id: 'ord_testId777',
    state: 'ROUTING',
    patient: generatePatient({ name: { full: 'Jane Doe' } }),
    fills: [generateFill('test-treatment')],
    fulfillments: [generateFulfillment({ state: 'PROCESSING' })]
  });

  beforeEach(() => {
    resetFeatureFlagMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
    resetFeatureFlagMocks();
  });

  test('For Local Pickup Pharmacies: navigate from pharmacy > status', async () => {
    const { getPharmaciesByLocation, setOrderPharmacy, getOrder } = await import('./api');
    const getOrderMock = vi.mocked(getOrder);
    getOrderMock.mockResolvedValue(testOrder);
    const getPharmaciesMock = vi.mocked(getPharmaciesByLocation);
    getPharmaciesMock.mockResolvedValue({
      pharmaciesByLocation: [
        generatePharmacy({
          id: 'phr_testId123',
          name: 'Test Local Pickup Pharmacy',
          price: 101,
          retailPrice: 1000
        })
      ]
    });
    const setOrderPharmacyMock = vi.mocked(setOrderPharmacy);
    setOrderPharmacyMock.mockResolvedValue(true);

    renderApp({ order: testOrder });

    expect(await screen.findByRole('heading', { name: 'Choose a Pharmacy' })).toBeInTheDocument();
    expect(screen.getByTestId('PrescriptionsSummary')).toBeInTheDocument();
    await expectTotalPageViewAnalyticsCountToBe(1);
    await userEvent.click(screen.getByText('Test Local Pickup Pharmacy'));
    await userEvent.click(screen.getByText('Select pharmacy'));
    expect(setOrderPharmacyMock).toHaveBeenCalledWith(
      'ord_testId777',
      'phr_testId123',
      undefined,
      undefined,
      undefined,
      true
    );
    await waitFor(() => screen.findByText('Preparing order...'), { timeout: 2500 });
    expect(await screen.findByText('Preparing order...')).toBeInTheDocument();
    await expectTotalPageViewAnalyticsCountToBe(2);
  }, 10_000);

  test('For Mail Order Pharmacies: navigate from pharmacy > status', async () => {
    const { getPharmaciesByLocation, setOrderPharmacy, getOrder } = await import('./api');
    const getOrderMock = vi.mocked(getOrder);
    getOrderMock.mockResolvedValue(testOrder);
    const getPharmaciesMock = vi.mocked(getPharmaciesByLocation);
    getPharmaciesMock.mockResolvedValue({
      pharmaciesByLocation: [
        generatePharmacy({
          id: 'SUPER_TEST_MAIL_ORDER_PHARMACY',
          name: 'Test Mail Order Pharmacy',
          price: 101,
          retailPrice: 1000,
          fulfillmentTypes: ['MAIL_ORDER']
        })
      ]
    });
    const setOrderPharmacyMock = vi.mocked(setOrderPharmacy);
    setOrderPharmacyMock.mockResolvedValue(true);

    renderApp({ order: testOrder });

    expect(await screen.findByRole('heading', { name: 'Choose a Pharmacy' })).toBeInTheDocument();
    await expectTotalPageViewAnalyticsCountToBe(1);
    await userEvent.click(screen.getByText('Test Mail Order Pharmacy'));
    await userEvent.click(screen.getByText('Select pharmacy'));
    expect(setOrderPharmacyMock).toHaveBeenCalledWith(
      'ord_testId777',
      'SUPER_TEST_MAIL_ORDER_PHARMACY',
      undefined,
      undefined,
      undefined,
      true
    );

    await waitFor(() => screen.findByText('Preparing order...'), { timeout: 2500 });
    expect(await screen.findByText('Preparing order...')).toBeInTheDocument();
    await expectTotalPageViewAnalyticsCountToBe(2);
  }, 10_000);

  test('skips review and lands on pharmacy when patient has address', async () => {
    const { getOrder } = await import('./api');
    vi.mocked(getOrder).mockResolvedValue(testOrder);

    const { memoryRouter } = renderApp();

    await waitFor(() => {
      expect(memoryRouter.state.location.pathname).toBe('/pharmacy');
    });

    expect(screen.queryByText('Review your prescription')).not.toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Choose a Pharmacy' })).toBeInTheDocument();
    expect(screen.getByTestId('PrescriptionsSummary')).toBeInTheDocument();
  });

  test('lands on review when patient has no address', async () => {
    const { getOrder } = await import('./api');
    const noAddressOrder = {
      ...testOrder,
      patient: generatePatient({ name: { full: 'Jane Doe' }, address: undefined })
    };
    vi.mocked(getOrder).mockResolvedValue(noAddressOrder);

    const { memoryRouter } = renderApp();

    await waitFor(() => {
      expect(memoryRouter.state.location.pathname).toBe('/review');
    });

    expect(await screen.findByText('Review your prescription')).toBeInTheDocument();
    expect(screen.getByText('Add your address')).toBeInTheDocument();
  });
});

const resetFeatureFlagMocks = () => {
  mockPatientAnalytics.getFlagValue.mockImplementation(async (flagName: string) => {
    return FEATURE_FLAG_DEFAULTS[flagName as keyof typeof FEATURE_FLAG_DEFAULTS];
  });
  mockPatientAnalytics.getFlagValueSync.mockImplementation((flagName: string) => {
    return FEATURE_FLAG_DEFAULTS[flagName as keyof typeof FEATURE_FLAG_DEFAULTS];
  });
};

describe('Autorouted order redirects', () => {
  const assignedPharmacy = generatePharmacy({ id: 'phr_assigned', name: 'Assigned Pharmacy' });

  const createAutoroutedOrder = () =>
    generateOrder({
      id: 'ord_testId777',
      state: 'PLACED',
      patient: generatePatient({ name: { full: 'Jane Doe' } }),
      fills: [generateFill('test-treatment')],
      fulfillments: [generateFulfillment({ state: 'PROCESSING' })],
      pharmacy: assignedPharmacy,
      isReroutable: true,
      metadata: {
        routingHistory: [{ selector: 'AUTO' }]
      }
    });

  const createPatientSelectedOrder = () =>
    generateOrder({
      id: 'ord_testId777',
      state: 'PLACED',
      patient: generatePatient({ name: { full: 'Jane Doe' } }),
      fills: [generateFill('test-treatment')],
      fulfillments: [generateFulfillment({ state: 'PROCESSING' })],
      pharmacy: assignedPharmacy,
      isReroutable: true,
      metadata: {
        routingHistory: [{ selector: 'PATIENT' }]
      }
    });

  beforeEach(() => {
    localStorage.clear();
    resetFeatureFlagMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('Auto-routed reroutable order with pharmacy lands on pharmacy page', async () => {
    const { getOrder } = await import('./api');
    vi.mocked(getOrder).mockResolvedValue(createAutoroutedOrder());

    const { memoryRouter } = renderApp();

    await waitFor(() => {
      expect(memoryRouter.state.location.pathname).toBe('/pharmacy');
    });

    expect(await screen.findByRole('heading', { name: 'Choose a Pharmacy' })).toBeInTheDocument();
  });

  test('Auto-routed order with confirmed pharmacy lands on status page', async () => {
    markAutoroutedPharmacyConfirmed('ord_testId777');

    const { getOrder } = await import('./api');
    vi.mocked(getOrder).mockResolvedValue(createAutoroutedOrder());

    const { memoryRouter } = renderApp();

    await waitFor(() => {
      expect(memoryRouter.state.location.pathname).toBe('/status');
    });

    expect(await screen.findByText(/preparing order/i)).toBeInTheDocument();
  });

  test('Patient-selected order with pharmacy lands on status page', async () => {
    const { getOrder } = await import('./api');
    vi.mocked(getOrder).mockResolvedValue(createPatientSelectedOrder());

    const { memoryRouter } = renderApp();

    await waitFor(() => {
      expect(memoryRouter.state.location.pathname).toBe('/status');
    });

    expect(await screen.findByText(/preparing order/i)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Choose a Pharmacy' })).not.toBeInTheDocument();
  });
});

const renderApp = (_order: Partial<OrderContextType> = {}) => {
  const memoryRouter = createMemoryRouter(createRoutesFromElements(routeElements), {
    initialEntries: [`/?orderId=ord_testId777&token=${mockToken}`]
  });

  return { render: render(<RouterProvider router={memoryRouter} />), memoryRouter };
};

async function expectTotalPageViewAnalyticsCountToBe(times: number) {
  await waitFor(() => expect(mockPatientAnalytics.page).toHaveBeenCalledTimes(times));
}
