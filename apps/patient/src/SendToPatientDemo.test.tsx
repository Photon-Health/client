import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, vi } from 'vitest';
import { createMemoryRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { routeElements } from './Routes';
import { getOfferBundles, triggerDemoNotification } from './api';
import { demoPharmacies } from './data/demoPharmacies';

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
  fetchOfferBundles: vi.fn().mockResolvedValue([]),
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
    await screen.findByText('When do you need your order ready by?', {}, { timeout: 2100 });

    await userEvent.click(screen.getByText('Urgent'));
    await userEvent.click(screen.getByText('Next'));

    await waitFor(() => screen.findByText('Preparing order...'), { timeout: 2500 });
    expect(await screen.findByText('Preparing order...')).toBeInTheDocument();
  }, 10_000);

  test('allows mail order pharmacy selection', async () => {
    renderDemoApp();

    expect(await screen.findByText('Review your prescriptions')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Search for a pharmacy' }));
    expect(await screen.findByRole('heading', { name: 'Choose a Pharmacy' })).toBeInTheDocument();
    expect(screen.getByText('Home Delivery')).toBeInTheDocument();
    await userEvent.click(screen.getByText('See all mail orders'));

    await userEvent.click(screen.getByText('Capsule Pharmacy'));
    await userEvent.click(screen.getByText('Place Order'));

    await waitFor(() => screen.findByText('Preparing order...'), { timeout: 2500 });

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

    await waitFor(() => screen.findByText('Order placed'), { timeout: 2500 });
    expect(await screen.findByText('Amazon Pharmacy')).toBeInTheDocument();
  }, 10_000);

  test('displays coupon prices for non-offer pharmacies', async () => {
    const expectedNumberOfCouponPrices = demoPharmacies.filter((p) => p.price).length;
    renderDemoApp();

    expect(await screen.findByText('Review your prescriptions')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Search for a pharmacy' }));

    expect(await screen.getAllByText('Coupon Price')).toHaveLength(expectedNumberOfCouponPrices);
  }, 10_000);
});

const renderDemoApp = () => {
  const memoryRouter = createMemoryRouter(createRoutesFromElements(routeElements), {
    initialEntries: [`/?demo=true&phone=8005551212`]
  });

  return { render: render(<RouterProvider router={memoryRouter} />), memoryRouter };
};
