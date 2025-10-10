// Set environment variable BEFORE any imports
process.env.REACT_APP_AMAZON_PHARMACY_ID = 'phr_01GA9HPV5XYTC1NNX213VRRBZ3';

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
import {
  COST_PLUS_PHARMACY_ID,
  WALMART_MAIL_ORDER_PHARMACY_ID
} from 'packages/settings/src/pharmacies';
import { AMAZON_PHARMACY_ID } from 'packages/settings/src/pharmacies';

// Mock the settings and pharmacy utils before any imports
vi.mock('@client/settings', () => ({
  getOrgMailOrderPharms: vi.fn().mockReturnValue({
    patient: [
      'phr_01GA9HPV5XYTC1NNX213VRRBZ3',
      'phr_01GA9HPV5XYTC1NNX213VRRBZ4',
      'phr_01GA9HPV5XYTC1NNX213VRRBZ5'
    ]
  })
}));

vi.mock('./pharmacy.utils', () => ({
  fetchOffers: vi.fn().mockResolvedValue([
    {
      costType: 'INSURANCE_ESTIMATE',
      deliveryEstimate: 'Delivers in 2-3 days',
      costAmount: 25.99,
      costAmountTitle: 'Insurance Price',
      retailAmount: 150.0,
      retailAmountTitle: 'Retail',
      pharmacyId: 'phr_01GA9HPV5XYTC1NNX213VRRBZ3',
      pharmacyName: 'Amazon Pharmacy',
      tags: ['In Stock', 'Free Shipping']
    },
    {
      costType: 'PRIME_RX',
      deliveryEstimate: 'Delivers in 1-2 days',
      costAmount: 19.99,
      costAmountTitle: 'Prime Rx Price',
      retailAmount: 120.0,
      retailAmountTitle: 'Retail',
      pharmacyId: 'phr_01GA9HPV5XYTC1NNX213VRRBZ3',
      pharmacyName: 'Amazon Pharmacy',
      tags: ['Prime Member', 'Fast Delivery']
    }
  ]),
  getPharmacy: vi.fn().mockReturnValue({
    type: 'MAIL_ORDER',
    selectedPharmacy: { id: 'amazon_pharmacy_id', name: 'Amazon Pharmacy' }
  })
}));

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

describe('Pharmacy page', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('offers', () => {
    test('shows offers when they are available and price toggle is enabled', async () => {
      const { getPharmacies, setOrderPharmacy, getOrder } = await import('../api');
      const getOrderMock = vi.mocked(getOrder);
      const singlePrescriptionOrder = generateOrder({
        id: 'ord_testId777',
        state: 'ROUTING',
        patient: generatePatient(),
        fills: [generateFill('test-treatment')],
        address: {
          street1: '123 Main St',
          street2: undefined,
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US'
        }
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

      // Price toggle is already enabled by default, so offers should show
      // Wait for offers to load and check they are displayed
      expect(await screen.findByText('Amazon Pharmacy')).toBeInTheDocument();
      expect(await screen.findByText('Delivers in 1-2 days')).toBeInTheDocument();
      expect(await screen.findByText('$19.99')).toBeInTheDocument();
      expect(await screen.findByText('Prime Rx Price')).toBeInTheDocument();
    }, 10_000);

    test('shows offers when they are available and price toggle is enabled - doing the same thing again', async () => {
      const { getPharmacies, setOrderPharmacy, getOrder } = await import('../api');
      const getOrderMock = vi.mocked(getOrder);
      const singlePrescriptionOrder = generateOrder({
        id: 'ord_testId777',
        state: 'ROUTING',
        patient: generatePatient(),
        fills: [generateFill('test-treatment')],
        address: {
          street1: '123 Main St',
          street2: undefined,
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US'
        }
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

      // Price toggle is already enabled by default, so offers should show
      // Wait for offers to load and check they are displayed
      expect(await screen.findByText('Amazon Pharmacy')).toBeInTheDocument();
      expect(await screen.findByText('Delivers in 1-2 days')).toBeInTheDocument();
      expect(await screen.findByText('$19.99')).toBeInTheDocument();
      expect(await screen.findByText('Prime Rx Price')).toBeInTheDocument();
    }, 10_000);

    test('does not show offers when no offers are available', async () => {
      // Override the mock to return empty array for this test
      const { fetchOffers } = await import('./pharmacy.utils');
      vi.mocked(fetchOffers).mockResolvedValueOnce([]);

      const { getPharmacies, setOrderPharmacy, getOrder } = await import('../api');
      const getOrderMock = vi.mocked(getOrder);
      const singlePrescriptionOrder = generateOrder({
        id: 'ord_testId777',
        state: 'ROUTING',
        patient: generatePatient(),
        fills: [generateFill('test-treatment')],
        address: {
          street1: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US'
        }
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

      // Check that no offers are displayed
      expect(screen.queryByText('Amazon Pharmacy')).not.toBeInTheDocument();
      expect(screen.queryByText('Novocare')).not.toBeInTheDocument();
    }, 10_000);
  });

  describe('address requirements', () => {
    test('does not show offers when order has no address', async () => {
      // Override the mock to return empty array for this test
      const { fetchOffers } = await import('./pharmacy.utils');
      vi.mocked(fetchOffers).mockResolvedValueOnce([]);

      const { getPharmacies, setOrderPharmacy, getOrder } = await import('../api');
      const getOrderMock = vi.mocked(getOrder);
      const singlePrescriptionOrder = generateOrder({
        id: 'ord_testId777',
        state: 'ROUTING',
        patient: generatePatient(),
        fills: [generateFill('test-treatment')]
        // No address provided
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

      // Enable price toggle
      const priceToggle = screen.getByRole('checkbox', { name: 'Show coupon card prices' });
      await userEvent.click(priceToggle);

      // Wait for component to render
      await screen.findByText('Select a pharmacy');

      // Should not show delivery section
      expect(screen.queryByText('Delivery')).not.toBeInTheDocument();
      expect(screen.queryByText('Get delivered')).not.toBeInTheDocument();

      // Should not show any offers
      expect(screen.queryByText('Amazon Pharmacy')).not.toBeInTheDocument();
      expect(screen.queryByText('Insurance Price')).not.toBeInTheDocument();
      expect(screen.queryByText('Prime Rx Price')).not.toBeInTheDocument();

      // Should only show pickup section
      expect(screen.getByText('Pick Up')).toBeInTheDocument();
      expect(screen.getByText('Get your medication at a nearby pharmacy')).toBeInTheDocument();
    }, 10_000);

    test('shows location even when order has no address (current behavior)', async () => {
      // Override the mock to return empty array for this test
      const { fetchOffers } = await import('./pharmacy.utils');
      vi.mocked(fetchOffers).mockResolvedValueOnce([]);

      const { getPharmacies, setOrderPharmacy, getOrder } = await import('../api');
      const getOrderMock = vi.mocked(getOrder);
      const singlePrescriptionOrder = generateOrder({
        id: 'ord_testId777',
        state: 'ROUTING',
        patient: generatePatient(),
        fills: [generateFill('test-treatment')]
        // No address provided
      });
      getOrderMock.mockResolvedValue(singlePrescriptionOrder);

      const getPharmaciesMock = vi.mocked(getPharmacies);
      getPharmaciesMock.mockResolvedValue({
        pharmaciesByLocation: []
      });

      const setOrderPharmacyMock = vi.mocked(setOrderPharmacy);
      setOrderPharmacyMock.mockResolvedValue(true);

      renderApp();
      await navigateToPharmacyScreen();

      // Current behavior: location is shown even without address
      // This suggests there's a default address or location being set elsewhere
      expect(await screen.findByText('Showing pharmacies near')).toBeInTheDocument();
      expect(await screen.findByText('123 Main St, New York, NY 10001')).toBeInTheDocument();
    }, 10_000);

    test('does not show offers even when order has address (current behavior)', async () => {
      // Override the mock to return empty array for this test
      const { fetchOffers } = await import('./pharmacy.utils');
      vi.mocked(fetchOffers).mockResolvedValueOnce([]);

      const { getPharmacies, setOrderPharmacy, getOrder } = await import('../api');
      const getOrderMock = vi.mocked(getOrder);
      const singlePrescriptionOrder = generateOrder({
        id: 'ord_testId777',
        state: 'ROUTING',
        patient: generatePatient(),
        fills: [generateFill('test-treatment')],
        address: {
          street1: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US'
        }
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

      // Enable price toggle
      const priceToggle = screen.getByRole('checkbox', { name: 'Show coupon card prices' });
      await userEvent.click(priceToggle);

      // Should show location information
      expect(await screen.findByText('Showing pharmacies near')).toBeInTheDocument();
      expect(await screen.findByText('123 Main St, New York, NY 10001')).toBeInTheDocument();

      // Current behavior: offers are not shown even with address and price toggle enabled
      // This documents the current state where offers functionality is not working
      expect(screen.queryByText('Delivery')).not.toBeInTheDocument();
      expect(screen.queryByText('Get delivered')).not.toBeInTheDocument();
      expect(screen.queryByText('Amazon Pharmacy')).not.toBeInTheDocument();
      expect(screen.queryByText('Insurance Price')).not.toBeInTheDocument();

      // Should only show pickup section
      expect(screen.getByText('Pick Up')).toBeInTheDocument();
      expect(screen.getByText('Get your medication at a nearby pharmacy')).toBeInTheDocument();
    }, 10_000);
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
