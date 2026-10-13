import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, vi } from 'vitest';
import { createMemoryRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { routeElements } from './Routes';
import { triggerDemoNotification } from './api';
import { demoPharmacies } from './data/demoPharmacies';
import { getPatientAnalytics } from './configs/analytics';
import { mockIntersectionObserver, scrollCardsIntoView } from './test-utils/intersectionObserver';

mockIntersectionObserver();

// unlike the global mock, hand demo mode its own no-op client the way production does,
// so getPatientAnalytics() here is the live client that real events would reach
vi.mock('./configs/analytics', async () => {
  const { FEATURE_FLAG_DEFAULTS } = await import('./configs/featureFlags');
  const createAnalytics = () => ({
    page: vi.fn(),
    identify: vi.fn(),
    track: vi.fn(),
    getFlagValue: vi.fn(
      async (flag: keyof typeof FEATURE_FLAG_DEFAULTS, fallback?: unknown) =>
        fallback ?? FEATURE_FLAG_DEFAULTS[flag]
    ),
    getFlagValueSync: vi.fn(
      (flag: keyof typeof FEATURE_FLAG_DEFAULTS, fallback?: unknown) =>
        fallback ?? FEATURE_FLAG_DEFAULTS[flag]
    )
  });
  const liveAnalytics = createAnalytics();
  const noopAnalytics = createAnalytics();
  return {
    getPatientAnalytics: (opts?: { noop: boolean }) => (opts?.noop ? noopAnalytics : liveAnalytics)
  };
});

const OFFER_EVENTS = ['Offer Impression', 'Offer Clicked', 'Offer Selected'];
const sentOfferEvents = () =>
  vi
    .mocked(getPatientAnalytics().track)
    .mock.calls.filter(([event]) => OFFER_EVENTS.includes(event))
    .map(([event, , properties]) => `${event}: ${properties?.offerType}`);

vi.mock('./api', () => ({
  geocode: vi.fn().mockResolvedValue({
    lat: 40.7128,
    lng: -74.006,
    address: '123 Main St, New York, NY 10001'
  }),
  getPharmacies: vi.fn().mockResolvedValue({ pharmacies: [] }),
  getOfferBundles: vi.fn().mockResolvedValue([]),
  triggerDemoNotification: vi.fn()
}));

vi.mock('./utils/preloadImage', () => ({
  preloadImage: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('./views/pharmacy.utils', () => ({
  fetchPharmacyOffers: vi.fn().mockResolvedValue([]),
  getPharmacy: vi.fn().mockReturnValue({
    type: 'PICKUP',
    selectedPharmacy: { id: 'phr_demo', name: 'Central Pharmacy' }
  })
}));

vi.mock('./hooks/usePageAnalytics');
vi.mock('react-ga4');
vi.mock('mixpanel-browser');

describe('Send To Patient Demo', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('allows pickup pharmacy selection', async () => {
    renderDemoApp();

    expect(await screen.findByText('Review your prescriptions')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Search for a pharmacy' }));
    expect(await screen.findByRole('heading', { name: 'Choose a Pharmacy' })).toBeInTheDocument();
    await userEvent.click(screen.getByText('Central Pharmacy'));
    await userEvent.click(screen.getByText('Select pharmacy'));

    // wait for 2sec button animations to complete
    expect(await screen.findByText(/preparing order/i, {}, { timeout: 2500 })).toBeInTheDocument();
  }, 10_000);

  test('allows mail order pharmacy selection', async () => {
    renderDemoApp();

    expect(await screen.findByText('Review your prescriptions')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Search for a pharmacy' }));
    expect(await screen.findByRole('heading', { name: 'Choose a Pharmacy' })).toBeInTheDocument();
    expect(screen.getByText('Delivery')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Delivery'));
    await userEvent.click(screen.getByText('Capsule Pharmacy'));
    await userEvent.click(screen.getByText('Select pharmacy'));

    expect(await screen.findByText(/Order placed/i, {}, { timeout: 2500 })).toBeInTheDocument();

    expect(triggerDemoNotification).toHaveBeenCalledWith(
      '8005551212',
      'photon:order:placed',
      'Capsule Pharmacy',
      undefined
    );

    expect(await screen.findByText('Capsule Pharmacy')).toBeInTheDocument();
  }, 10_000);

  test('allows offer-based pharmacy selection (i.e. Amazon)', async () => {
    renderDemoApp();

    expect(await screen.findByText('Review your prescriptions')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Search for a pharmacy' }));
    expect(await screen.findByRole('heading', { name: 'Choose a Pharmacy' })).toBeInTheDocument();

    await userEvent.click(screen.getByText('Amazon Pharmacy'));
    await userEvent.click(screen.getByText('Select pharmacy'));

    expect(await screen.findByText(/Order placed/i, {}, { timeout: 2500 })).toBeInTheDocument();
    expect(await screen.findByText('Amazon Pharmacy')).toBeInTheDocument();
  }, 10_000);

  test('sends no offer analytics when offers and coupon prices are seen and selected (TECH-1040 Q17)', async () => {
    renderDemoApp();

    expect(await screen.findByText('Review your prescriptions')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Search for a pharmacy' }));
    // an offer card and coupon-priced cards are both on screen
    expect(await screen.findByText('Amazon Pharmacy')).toBeInTheDocument();
    expect(screen.getAllByText('Coupon price').length).toBeGreaterThan(0);

    await scrollCardsIntoView();
    await userEvent.click(screen.getByText('Amazon Pharmacy'));
    await userEvent.click(screen.getByText('Select pharmacy'));
    expect(await screen.findByText(/Order placed/i, {}, { timeout: 2500 })).toBeInTheDocument();

    expect(sentOfferEvents()).toEqual([]);
  }, 10_000);

  test('displays coupon prices for non-offer pharmacies', async () => {
    const expectedNumberOfCouponPrices = demoPharmacies.filter((p) => p.price).length;
    renderDemoApp();

    expect(await screen.findByText('Review your prescriptions')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Search for a pharmacy' }));

    expect(await screen.getAllByText('Coupon price')).toHaveLength(expectedNumberOfCouponPrices);
  }, 10_000);
});

const renderDemoApp = () => {
  const memoryRouter = createMemoryRouter(createRoutesFromElements(routeElements), {
    initialEntries: [`/?demo=true&phone=8005551212`]
  });

  return { render: render(<RouterProvider router={memoryRouter} />), memoryRouter };
};
