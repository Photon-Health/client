import { render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import { routeElements } from './Routes';
import { getOrder } from './api';
import { graphQLClient } from './configs/graphqlClient';
import {
  generateFill,
  generateOrder,
  generatePatient,
  generatePharmacy
} from './test-utils/generators';
import { Pharmacy } from './__generated__/graphql';

const mockToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30';

// getPharmaciesByLocation is left unmocked: it's where coupon prices CVS won't accept get dropped
vi.mock('./api', async () => {
  const { getPharmaciesByLocation } = await vi.importActual<typeof import('./api/internal')>(
    './api/internal'
  );
  return {
    getPharmaciesByLocation,
    geocode: vi.fn().mockResolvedValue({
      lat: 40.7128,
      lng: -74.006,
      address: '123 Main St, New York, NY 10001'
    }),
    getOrder: vi.fn(),
    getPharmacies: vi.fn().mockResolvedValue({ pharmacies: [] }),
    getOfferBundles: vi.fn().mockResolvedValue([]),
    rerouteOrder: vi.fn(),
    setOrderPharmacy: vi.fn(),
    setPreferredPharmacy: vi.fn(),
    triggerDemoNotification: vi.fn(),
    AUTH_HEADER_ERRORS: []
  };
});

vi.mock('./configs/graphqlClient', () => ({
  setAuthHeader: vi.fn(),
  graphQLClient: {
    request: vi.fn().mockResolvedValue({}),
    GetPharmaciesByLocation: vi.fn()
  },
  gqlSerializer: {
    parse: vi.fn(),
    stringify: vi.fn()
  }
}));

vi.mock('./hooks/usePageAnalytics');
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
    PoweredBy: () => <div data-testid="powered-by">Powered By</div>,
    Nav: () => <div>Nav</div>,
    PrescriptionsList: () => <div>PrescriptionsList</div>
  };
});

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

const pharmacyWithCoupon = (overrides: Partial<Pharmacy>) =>
  generatePharmacy({
    fulfillmentTypes: ['PICK_UP'],
    distance: 0.1,
    price: 12.34,
    retailPrice: 56.78,
    ...overrides
  });

const routingOrder = generateOrder({
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

describe('Coupon card prices on the pharmacy list', () => {
  beforeEach(() => {
    vi.mocked(getOrder).mockResolvedValue(routingOrder);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('hides the GoodRx price at CVS', async () => {
    mockNearbyPharmacies([
      pharmacyWithCoupon({ id: 'phr_cvs', name: 'CVS Pharmacy', source: 'goodrx' })
    ]);

    renderApp();
    await navigateToPharmacyScreen();

    const card = await findPickupCard('CVS Pharmacy');
    expect(card).not.toHaveTextContent('$12.34');
    expect(card).not.toHaveTextContent('$56.78');
  }, 10_000);

  it('shows the RxSense price at CVS', async () => {
    mockNearbyPharmacies([
      pharmacyWithCoupon({ id: 'phr_cvs', name: 'CVS Pharmacy', source: 'rxsense' })
    ]);

    renderApp();
    await navigateToPharmacyScreen();

    expect(await findPickupCard('CVS Pharmacy')).toHaveTextContent('$12.34');
  }, 10_000);

  it('shows the GoodRx price at pharmacies other than CVS', async () => {
    mockNearbyPharmacies([
      pharmacyWithCoupon({ id: 'phr_walgreens', name: 'Walgreens', source: 'goodrx' })
    ]);

    renderApp();
    await navigateToPharmacyScreen();

    expect(await findPickupCard('Walgreens')).toHaveTextContent('$12.34');
  }, 10_000);

  it('only hides the GoodRx price on the CVS card when both are listed', async () => {
    mockNearbyPharmacies([
      pharmacyWithCoupon({ id: 'phr_cvs', name: 'CVS Pharmacy', source: 'goodrx' }),
      pharmacyWithCoupon({
        id: 'phr_walgreens',
        name: 'Walgreens',
        source: 'goodrx',
        price: 9.87,
        distance: 0.2
      })
    ]);

    renderApp();
    await navigateToPharmacyScreen();

    expect(await findPickupCard('CVS Pharmacy')).not.toHaveTextContent('$12.34');
    expect(await findPickupCard('Walgreens')).toHaveTextContent('$9.87');
  }, 10_000);
});

const mockNearbyPharmacies = (pharmacies: Pharmacy[]) =>
  vi
    .mocked(graphQLClient.GetPharmaciesByLocation)
    .mockResolvedValue({ pharmaciesByLocation: pharmacies });

const findPickupCard = async (name: string) =>
  within(await screen.findByRole('radiogroup', { name: 'Select a pickup pharmacy' })).findByRole(
    'radio',
    { name }
  );

const renderApp = () => {
  const memoryRouter = createMemoryRouter(createRoutesFromElements(routeElements), {
    initialEntries: [`/?orderId=ord_testId777&token=${mockToken}`]
  });

  return { render: render(<RouterProvider router={memoryRouter} />), memoryRouter };
};

async function navigateToPharmacyScreen() {
  expect(await screen.findByRole('heading', { name: 'Choose a Pharmacy' })).toBeInTheDocument();
}
