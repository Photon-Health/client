import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, vi } from 'vitest';
import { createMemoryRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import {
  generateFill,
  generateOrder,
  generatePatient,
  generatePharmacy
} from '../test-utils/generators';
import userEvent from '@testing-library/user-event';
import { routeElements } from '../Routes';

const mockToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30';

vi.mock('../api', () => ({
  geocode: vi.fn().mockResolvedValue({
    lat: 40.7128,
    lng: -74.006,
    address: '123 Main St, New York, NY 10001'
  }),
  getOrder: vi.fn(),
  getPharmacies: vi.fn().mockResolvedValue({ pharmaciesByLocation: [] }),
  getOffers: vi.fn().mockResolvedValue([]),
  rerouteOrder: vi.fn(),
  setOrderPharmacy: vi.fn(),
  setPreferredPharmacy: vi.fn(),
  triggerDemoNotification: vi.fn(),
  AUTH_HEADER_ERRORS: []
}));

vi.mock('../configs/graphqlClient', () => ({
  setAuthHeader: vi.fn(),
  graphQLClient: {
    request: vi.fn().mockResolvedValue({})
  },
  gqlSerializer: {
    parse: vi.fn(),
    stringify: vi.fn()
  }
}));

vi.mock('@datadog/browser-rum');
vi.mock('../configs/analytics');
vi.mock('../hooks/usePageAnalytics');
vi.mock('react-ga4');

vi.mock('../components', () => ({
  FixedFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="fixed-footer">{children}</div>
  ),
  LocationModal: () => <div data-testid="location-modal">Location Modal</div>,
  PoweredBy: () => <div data-testid="powered-by">Powered By</div>,
  Nav: () => <div>Nav</div>,
  PrescriptionsList: () => <div>PrescriptionsList</div>,
  DemoCtaModal: () => <div data-testid="demo-cta-modal">Demo Cta Modal</div>,
  PharmacyInfo: () => <div data-testid="pharmacy-info">Pharmacy Info</div>
}));

describe('Pharmacy page', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('shows enabled price toggle when order has 1 prescription', async () => {
    const { getPharmacies, setOrderPharmacy, getOrder } = await import('../api');
    const getOrderMock = vi.mocked(getOrder);
    const singlePrescriptionOrder = generateOrder({
      id: 'ord_testId777',
      state: 'ROUTING',
      patient: generatePatient(),
      fills: [generateFill('test-treatment')]
    });
    getOrderMock.mockResolvedValue(singlePrescriptionOrder);
    const getPharmaciesMock = vi.mocked(getPharmacies);
    getPharmaciesMock.mockResolvedValue({
      pharmaciesByLocation: [
        generatePharmacy({
          id: 'phr_testId123',
          name: 'Test Local Pickup Pharmacy',
          price: 444,
          retailPrice: 1000
        })
      ]
    });
    const setOrderPharmacyMock = vi.mocked(setOrderPharmacy);
    setOrderPharmacyMock.mockResolvedValue(true);

    renderApp();

    await navigateToPharmacyScreen();

    const priceToggle = screen.getByRole('checkbox', { name: 'Show coupon card prices' });
    expect(priceToggle).toBeInTheDocument();
    expect(priceToggle).toBeEnabled();

    expect(screen.getByText('Coupon Price')).toBeInTheDocument();
    expect(screen.getByText('$444')).toBeInTheDocument();
    expect(screen.getByText('Retail')).toBeInTheDocument();
    expect(screen.getByText('$1000')).toBeInTheDocument();

    const includePriceOptions = getPharmaciesMock.mock.calls.map((call) => {
      const options = call[0];
      return options.includePrice;
    });
    expect(includePriceOptions).not.toContain(false);
  }, 10_000);

  test('hides price toggle when order has 2+ prescriptions', async () => {
    const { getPharmacies, setOrderPharmacy, getOrder } = await import('../api');
    const getOrderMock = vi.mocked(getOrder);
    const multiPrescriptionOrder = generateOrder({
      id: 'ord_testId888',
      state: 'ROUTING',
      patient: generatePatient(),
      fills: [generateFill('test-treatment-1'), generateFill('test-treatment-2')]
    });
    getOrderMock.mockResolvedValue(multiPrescriptionOrder);
    const getPharmaciesMock = vi.mocked(getPharmacies);
    getPharmaciesMock.mockResolvedValue({
      pharmaciesByLocation: [
        generatePharmacy({
          id: 'phr_testId123',
          name: 'Test Local Pickup Pharmacy'
        })
      ]
    });
    const setOrderPharmacyMock = vi.mocked(setOrderPharmacy);
    setOrderPharmacyMock.mockResolvedValue(true);

    renderApp();

    expect(await screen.findByText('Review your prescriptions')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Search for a pharmacy' }));
    expect(await screen.findByText('Select a pharmacy')).toBeInTheDocument();

    const priceToggle = screen.queryByRole('checkbox', { name: 'Show coupon card prices' });
    expect(priceToggle).not.toBeInTheDocument();

    const callArgs = getPharmaciesMock.mock.calls.map((call) => call[0].includePrice);
    expect(callArgs).not.toContain(true);

    // ensure price UI is not showing in the cards
    expect(screen.queryByText('Coupon Price')).not.toBeInTheDocument();
    expect(screen.queryByText('Retail')).not.toBeInTheDocument();
  }, 10_000);
});

const renderApp = () => {
  const memoryRouter = createMemoryRouter(createRoutesFromElements(routeElements), {
    initialEntries: [`/?token=${mockToken}`]
  });

  return { render: render(<RouterProvider router={memoryRouter} />), memoryRouter };
};

async function navigateToPharmacyScreen() {
  expect(await screen.findByText('Review your prescription')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Search for a pharmacy' }));
  expect(await screen.findByText('Select a pharmacy')).toBeInTheDocument();
}
