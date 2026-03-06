import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, vi } from 'vitest';
import { createMemoryRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { routeElements } from './Routes';
import { triggerDemoNotification } from './api';

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

/**
 * Creates a fake unsigned JWT with the given payload.
 * The app only base64-decodes the payload segment — it does not verify signatures.
 */
function makeFakeDemoJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.fakesig`;
}

describe('Send To Patient Demo (legacy query params)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('allows pickup pharmacy selection', async () => {
    renderDemoApp();

    expect(await screen.findByText('Review your prescriptions')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Search for a pharmacy' }));
    expect(await screen.findByText('Select a pharmacy')).toBeInTheDocument();
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
    expect(await screen.findByText('Select a pharmacy')).toBeInTheDocument();
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
    expect(await screen.findByText('Select a pharmacy')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Amazon Pharmacy'));
    await userEvent.click(screen.getByText('Select pharmacy'));

    await waitFor(() => screen.findByText('Order placed'), { timeout: 2500 });
    expect(await screen.findByText('Amazon Pharmacy')).toBeInTheDocument();
  }, 10_000);
});

describe('Send To Patient Demo (JWT token)', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('demo-select-pharmacy JWT starts at review page', async () => {
    const token = makeFakeDemoJwt({
      demo: true,
      phoneNumber: '+15551234567',
      context: 'demo-select-pharmacy',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    });

    renderDemoAppWithToken(token);

    expect(await screen.findByText('Review your prescriptions')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Search for a pharmacy' }));
    expect(await screen.findByText('Select a pharmacy')).toBeInTheDocument();
  }, 10_000);

  test('demo-select-pharmacy JWT allows pickup pharmacy selection', async () => {
    const token = makeFakeDemoJwt({
      demo: true,
      phoneNumber: '+15551234567',
      context: 'demo-select-pharmacy',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    });

    renderDemoAppWithToken(token);

    expect(await screen.findByText('Review your prescriptions')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Search for a pharmacy' }));
    expect(await screen.findByText('Select a pharmacy')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Central Pharmacy'));
    await userEvent.click(screen.getByText('Select pharmacy'));

    await screen.findByText('When do you need your order ready by?', {}, { timeout: 2100 });

    await userEvent.click(screen.getByText('Urgent'));
    await userEvent.click(screen.getByText('Next'));

    await waitFor(() => screen.findByText('Preparing order...'), { timeout: 2500 });
    expect(await screen.findByText('Preparing order...')).toBeInTheDocument();
  }, 10_000);

  test('demo-order-status JWT lands directly on status page', async () => {
    const token = makeFakeDemoJwt({
      demo: true,
      phoneNumber: '+15551234567',
      context: 'demo-order-status',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    });

    renderDemoAppWithToken(token);

    // Should go directly to status page with a pre-selected pharmacy
    expect(await screen.findByText('Preparing order...')).toBeInTheDocument();
    expect(await screen.findByText('Central Pharmacy')).toBeInTheDocument();
  }, 10_000);
});

const renderDemoApp = () => {
  const memoryRouter = createMemoryRouter(createRoutesFromElements(routeElements), {
    initialEntries: [`/?demo=true&phone=8005551212`]
  });

  return { render: render(<RouterProvider router={memoryRouter} />), memoryRouter };
};

const renderDemoAppWithToken = (token: string) => {
  const memoryRouter = createMemoryRouter(createRoutesFromElements(routeElements), {
    initialEntries: [`/?token=${encodeURIComponent(token)}`]
  });

  return { render: render(<RouterProvider router={memoryRouter} />), memoryRouter };
};
