import { render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { routeElements } from './Routes';
import { getOfferBundles, getOrder, getPharmaciesByLocation } from './api';
import {
  generateFill,
  generateOrder,
  generatePatient,
  generatePharmacy
} from './test-utils/generators';
import { Pharmacy } from './__generated__/graphql';

const mockToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30';

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

type OfferBundles = Awaited<ReturnType<typeof getOfferBundles>>;

const offerPickupPharmacy = generatePharmacy({
  id: 'phr_offerPickup',
  name: 'Offer Pickup Pharmacy',
  fulfillmentTypes: ['PICK_UP']
});

const offerMailOrderPharmacy = generatePharmacy({
  id: 'phr_offerMailOrder',
  name: 'Offer Mail Order Pharmacy',
  fulfillmentTypes: ['MAIL_ORDER']
});

const inTabOfferBundles = [
  {
    source: 'TEST_SOURCE',
    isPromoted: false,
    pharmacy: offerPickupPharmacy,
    attributeTags: [{ kind: 'ONSITE_PICKUP', label: 'On-site pick up' }],
    offers: []
  },
  {
    source: 'TEST_SOURCE',
    isPromoted: false,
    pharmacy: offerMailOrderPharmacy,
    attributeTags: [{ kind: 'FREE_DELIVERY', label: 'Free delivery' }],
    offers: []
  }
] as unknown as OfferBundles;

const nearbyPharmacies: Pharmacy[] = [1, 2, 3, 4].map((n) =>
  generatePharmacy({
    id: `phr_nearby${n}`,
    name: `Nearby Pharmacy ${n}`,
    fulfillmentTypes: ['PICK_UP'],
    distance: n / 10
  })
);

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

describe('Pickup offer placement', () => {
  beforeEach(() => {
    vi.mocked(getOrder).mockResolvedValue(routingOrder);
    vi.mocked(getOfferBundles).mockResolvedValue(inTabOfferBundles);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('leads the Pick up tab when its pharmacy is further down the nearby results', async () => {
    vi.mocked(getPharmaciesByLocation).mockResolvedValue({
      pharmaciesByLocation: [...nearbyPharmacies, offerPickupPharmacy]
    });

    renderApp();
    await navigateToPharmacyScreen();
    expect(await screen.findByText('On-site pick up')).toBeInTheDocument();

    const names = pickupCardNames();
    expect(names[0]).toBe('Offer Pickup Pharmacy');
    expect(names.filter((name) => name === 'Offer Pickup Pharmacy')).toHaveLength(1);
  }, 10_000);

  it('leads the Pick up tab when its pharmacy is not in the nearby results', async () => {
    vi.mocked(getPharmaciesByLocation).mockResolvedValue({
      pharmaciesByLocation: nearbyPharmacies
    });

    renderApp();
    await navigateToPharmacyScreen();
    expect(await screen.findByText('Nearby Pharmacy 1')).toBeInTheDocument();

    expect(pickupCardNames()[0]).toBe('Offer Pickup Pharmacy');
    expect(screen.getByText('On-site pick up')).toBeInTheDocument();
  }, 10_000);

  it('shows the mail-order offer on the Delivery tab', async () => {
    vi.mocked(getPharmaciesByLocation).mockResolvedValue({
      pharmaciesByLocation: nearbyPharmacies
    });

    renderApp();
    await navigateToPharmacyScreen();
    await userEvent.click(screen.getByRole('tab', { name: /delivery/i }));

    expect(await screen.findByText('Offer Mail Order Pharmacy')).toBeInTheDocument();
    expect(screen.getByText('Free delivery')).toBeInTheDocument();
  }, 10_000);

  it('shows a lone promoted offer above the tabs instead of in the Pick up list', async () => {
    vi.mocked(getOfferBundles).mockResolvedValue([
      {
        source: 'TEST_SOURCE',
        isPromoted: true,
        pharmacy: offerPickupPharmacy,
        attributeTags: [{ kind: 'ONSITE_PICKUP', label: 'On-site pick up' }],
        offers: []
      }
    ] as unknown as OfferBundles);
    vi.mocked(getPharmaciesByLocation).mockResolvedValue({
      pharmaciesByLocation: [...nearbyPharmacies, offerPickupPharmacy]
    });

    renderApp();
    await navigateToPharmacyScreen();
    expect(await screen.findByText('Nearby Pharmacy 1')).toBeInTheDocument();

    const aboveTabsCardNames = within(screen.getByRole('radiogroup', { name: 'Select a pharmacy' }))
      .getAllByRole('radio')
      .map((card) => card.getAttribute('aria-label'));
    expect(aboveTabsCardNames).toEqual(['Offer Pickup Pharmacy']);
    expect(pickupCardNames()).not.toContain('Offer Pickup Pharmacy');
  }, 10_000);

  it('keeps the nearby results in order when there are no offer bundles', async () => {
    vi.mocked(getOfferBundles).mockResolvedValue([]);
    vi.mocked(getPharmaciesByLocation).mockResolvedValue({
      pharmaciesByLocation: nearbyPharmacies
    });

    renderApp();
    await navigateToPharmacyScreen();
    expect(await screen.findByText('Nearby Pharmacy 1')).toBeInTheDocument();

    expect(pickupCardNames()).toEqual([
      'Nearby Pharmacy 1',
      'Nearby Pharmacy 2',
      'Nearby Pharmacy 3',
      'Nearby Pharmacy 4'
    ]);
    expect(screen.queryByText('On-site pick up')).not.toBeInTheDocument();
  }, 10_000);
});

const pickupCardNames = () =>
  within(screen.getByRole('radiogroup', { name: 'Select a pickup pharmacy' }))
    .getAllByRole('radio')
    .map((card) => card.getAttribute('aria-label'));

const renderApp = () => {
  const memoryRouter = createMemoryRouter(createRoutesFromElements(routeElements), {
    initialEntries: [`/?orderId=ord_testId777&token=${mockToken}`]
  });

  return { render: render(<RouterProvider router={memoryRouter} />), memoryRouter };
};

async function navigateToPharmacyScreen() {
  expect(await screen.findByRole('heading', { name: 'Choose a Pharmacy' })).toBeInTheDocument();
}
