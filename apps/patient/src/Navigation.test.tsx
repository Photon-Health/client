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

vi.mock('./api', () => ({
  geocode: vi.fn().mockResolvedValue({
    lat: 40.7128,
    lng: -74.006,
    address: '123 Main St, New York, NY 10001'
  }),
  getOrder: vi.fn(),
  getPharmacies: vi.fn().mockResolvedValue({ pharmaciesByLocation: [] }),
  rerouteOrder: vi.fn(),
  setOrderPharmacy: vi.fn(),
  setPreferredPharmacy: vi.fn(),
  triggerDemoNotification: vi.fn(),
  AUTH_HEADER_ERRORS: []
}));

vi.mock('./configs/graphqlClient', () => ({
  setAuthHeader: vi.fn(),
  graphQLClient: {
    request: vi.fn().mockResolvedValue({}),
    GetOffersForOrder: vi.fn().mockResolvedValue({ offers: [] })
  },
  gqlSerializer: {
    parse: vi.fn(),
    stringify: vi.fn()
  }
}));

vi.mock('@datadog/browser-rum');
vi.mock('./configs/analytics');
vi.mock('./hooks/usePageAnalytics');
vi.mock('react-ga4');

vi.mock('./components', () => ({
  CouponModal: () => <div data-testid="coupon-modal">Coupon Modal</div>,
  FixedFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="fixed-footer">{children}</div>
  ),
  LocationModal: () => <div data-testid="location-modal">Location Modal</div>,
  PoweredBy: () => <div data-testid="powered-by">Powered By</div>,
  Nav: () => <div>Nav</div>,
  PrescriptionsList: () => <div>PrescriptionsList</div>,
  DemoCtaModal: () => <div data-testid="demo-cta-modal">Demo Cta Modal</div>,
  PharmacyInfo: () => <div data-testid="pharmacy-info">Pharmacy Info</div>,
  Coupons: () => <div data-testid="coupons">Coupons</div>
}));

describe('App', () => {
  const testOrder = generateOrder({
    id: 'ord_testId777',
    state: 'ROUTING',
    patient: generatePatient({ name: { full: 'Jane Doe' } }),
    fills: [generateFill('test-treatment')],
    fulfillments: [generateFulfillment({ state: 'PROCESSING' })]
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('navigates from review page to readyBy to pharmacy to status', async () => {
    const { getPharmacies, setOrderPharmacy, getOrder } = await import('./api');
    const getOrderMock = vi.mocked(getOrder);
    getOrderMock.mockResolvedValue(testOrder);
    const getPharmaciesMock = vi.mocked(getPharmacies);
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

    expect(await screen.findByText('Review your prescription')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Search for a pharmacy' }));
    expect(await screen.findByText('When do you need your order ready by?')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Urgent'));
    await userEvent.click(screen.getByText('Next'));
    expect(setOrderPharmacyMock).not.toHaveBeenCalled();
    expect(await screen.findByText('Select a pharmacy')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Test Local Pickup Pharmacy'));
    await userEvent.click(screen.getByText('Select pharmacy'));
    expect(setOrderPharmacyMock).toHaveBeenCalledWith(
      'ord_testId777',
      'phr_testId123',
      'Urgent',
      'Today',
      expect.anything(),
      true
    );
    await waitFor(() => screen.findByText('Preparing order...'), { timeout: 2500 });
    expect(await screen.findByText('Preparing order...')).toBeInTheDocument();
  }, 10_000);
});

const renderApp = (order: Partial<OrderContextType> = {}) => {
  const memoryRouter = createMemoryRouter(createRoutesFromElements(routeElements), {
    initialEntries: ['/']
  });

  return { render: render(<RouterProvider router={memoryRouter} />), memoryRouter };
};
