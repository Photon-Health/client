import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, vi } from 'vitest';
import { createMemoryRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { routeElements } from './Routes';

vi.mock('./api', () => ({
  geocode: vi.fn().mockResolvedValue({
    lat: 40.7128,
    lng: -74.006,
    address: '123 Main St, New York, NY 10001'
  }),
  getPharmacies: vi.fn().mockResolvedValue({ pharmacies: [] }),
  getOffers: vi.fn().mockResolvedValue([]),
  triggerDemoNotification: vi.fn()
}));

vi.mock('./utils/preloadImage', () => ({
  preloadImage: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('@datadog/browser-rum');
vi.mock('./configs/analytics');
vi.mock('./hooks/usePageAnalytics');
vi.mock('react-ga4');

describe('Send To Patient Demo', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('navigates from review > pharmacy > readyBy > status', async () => {
    renderDemoApp();

    expect(await screen.findByText('Review your prescriptions')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Search for a pharmacy' }));
    expect(await screen.findByText('Select a pharmacy')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Central Pharmacy'));
    await userEvent.click(screen.getByText('Select pharmacy'));

    await waitFor(() => screen.findByText('When do you need your order ready by?'), {
      // wait for 2sec button animations to complete
      timeout: 2100
    });

    await userEvent.click(screen.getByText('Urgent'));
    await userEvent.click(screen.getByText('Next'));

    await waitFor(() => screen.findByText('Preparing order...'), { timeout: 2500 });
    expect(await screen.findByText('Preparing order...')).toBeInTheDocument();
  }, 10_000);

  test('allows mail order pharmacy selection', async () => {
    renderDemoApp();

    expect(await screen.findByText('Review your prescriptions')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Search for a pharmacy' }));
    expect(await screen.findByText('Select a pharmacy')).toBeInTheDocument();
    expect(screen.getByText('Home Delivery')).toBeInTheDocument();
    await userEvent.click(screen.getByText('See all mail orders'));

    await userEvent.click(screen.getByText('Amazon Pharmacy'));
    await userEvent.click(screen.getByText('Place Order'));

    await waitFor(() => screen.findByText('Order placed'), { timeout: 2500 });
    expect(await screen.findByText('Amazon Pharmacy')).toBeInTheDocument();
  }, 10_000);

  test('allows Offer-based pharmacy selection (i.e. Amazon)', async () => {
    renderDemoApp();

    expect(await screen.findByText('Review your prescriptions')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Search for a pharmacy' }));
    expect(await screen.findByText('Select a pharmacy')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Amazon Pharmacy'));
    await userEvent.click(screen.getByText('Select pharmacy'));

    await waitFor(() => screen.findByText('Order placed'), { timeout: 2500 });
    expect(await screen.findByText('Amazon Pharmacy')).toBeInTheDocument();
  }, 10_000);
});

const renderDemoApp = () => {
  const memoryRouter = createMemoryRouter(createRoutesFromElements(routeElements), {
    initialEntries: [`/?demo=true&phone=8005551212`]
  });

  return { render: render(<RouterProvider router={memoryRouter} />), memoryRouter };
};
