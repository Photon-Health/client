import { vi } from 'vitest';
import type { ReactNode } from 'react';
import { createMemoryRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import { routeElements } from '../Routes';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  generateDiscountCard,
  generateFill,
  generateOrder,
  generatePatient,
  generatePharmacy
} from '../test-utils/generators';
import { Order } from '../utils/models';
import { getOrder } from '../api';
import { FEATURE_FLAG_DEFAULTS } from '../configs/featureFlags';

vi.mock('../api', () => ({
  triggerDemoNotification: vi.fn(),
  geocode: vi.fn().mockResolvedValue({
    lat: 0,
    lng: 0,
    address: 'mocked address'
  }),
  getOrder: vi.fn(),
  getPharmaciesByLocation: vi.fn().mockResolvedValue({ pharmaciesByLocation: [] }),
  getPharmacies: vi.fn().mockResolvedValue([]),
  getOfferBundles: vi.fn().mockResolvedValue([]),
  AUTH_HEADER_ERRORS: []
}));

vi.mock('@datadog/browser-rum');
vi.mock('react-ga4');
vi.mock('mixpanel-browser');

vi.mock('../hooks/usePatientAnalytics', () => ({
  usePatientAnalytics: vi.fn(() => ({
    track: vi.fn(),
    page: vi.fn(),
    identify: vi.fn(),
    getFlagValue: vi.fn(async (flagName: string) => {
      return FEATURE_FLAG_DEFAULTS[flagName as keyof typeof FEATURE_FLAG_DEFAULTS];
    }),
    getFlagValueSync: vi.fn((flagName: string) => {
      return FEATURE_FLAG_DEFAULTS[flagName as keyof typeof FEATURE_FLAG_DEFAULTS];
    })
  })),
  PatientAnalyticsProvider: ({ children }: { children: ReactNode }) => children
}));

describe('Status page Coupon cards', () => {
  test('shows external URL if present', async () => {
    renderAppAtStatusView({
      pharmacy: generatePharmacy({ id: 'phr_forDiscountCardTest' }),
      discountCards: [
        generateDiscountCard({
          pharmacyId: 'phr_forDiscountCardTest',
          externalUrl: 'coupon-card-test-url'
        })
      ]
    });

    expect(await screen.findByText('Order is likely ready')).toBeInTheDocument();

    const couponButton = await screen.findByRole('link', { name: /get coupon/i });

    window.open = vi.fn();
    await userEvent.click(couponButton);
    expect(window.open).toHaveBeenCalledWith(
      'coupon-card-test-url',
      '_blank',
      'noopener,noreferrer'
    );
    vi.mocked(window.open).mockRestore();
  });

  test('shows coupon details when there is no external URL', async () => {
    renderAppAtStatusView({
      pharmacy: generatePharmacy({ id: 'phr_forDiscountCardTest' }),
      discountCards: [
        generateDiscountCard({
          pharmacyId: 'phr_forDiscountCardTest',
          bin: 'test-bin',
          pcn: 'test-pcn',
          group: 'test-group',
          memberId: 'test-member-id',
          externalUrl: undefined
        })
      ]
    });

    expect(await screen.findByText('Order is likely ready')).toBeInTheDocument();

    expect(screen.queryByRole('button', { name: /get coupon/i })).not.toBeInTheDocument();

    expect(screen.getByText('test-bin')).toBeInTheDocument();
    expect(screen.getByText('test-pcn')).toBeInTheDocument();
    expect(screen.getByText('test-group')).toBeInTheDocument();
    expect(screen.getByText('test-member-id')).toBeInTheDocument();
  });

  test('hides coupon details when fields are missing', async () => {
    renderAppAtStatusView({
      pharmacy: generatePharmacy({ id: 'phr_forDiscountCardTest' }),
      discountCards: [
        generateDiscountCard({
          pharmacyId: 'phr_forDiscountCardTest',
          bin: undefined
        })
      ]
    });

    expect(await screen.findByText('Order is likely ready')).toBeInTheDocument();

    expect(screen.queryByText('Coupon card')).not.toBeInTheDocument();
  });
});

describe('Status page Rerouting', () => {
  const reroutableOrderBase: Partial<Order> = {
    state: 'PLACED',
    isReroutable: true,
    organization: {
      id: 'org_test',
      name: 'Test Org',
      settings: {
        brandColor: '',
        patientUx: { enablePatientRerouting: true }
      }
    }
  };

  test('navigates directly to pharmacy page without modal when unresolved ORDER_ERROR exists', async () => {
    const { memoryRouter } = await renderAppAtStatusView({
      ...reroutableOrderBase,
      exceptions: [{ exceptionType: 'ORDER_ERROR', resolvedAt: null }]
    });

    await userEvent.click(await screen.findByRole('button', { name: /change pharmacy/i }));

    expect(
      screen.queryByText('Let us know why you want to change pharmacies')
    ).not.toBeInTheDocument();
    expect(memoryRouter.state.location.pathname).toBe('/pharmacy');
  });

  test('shows reasons modal when ORDER_ERROR is resolved', async () => {
    renderAppAtStatusView({
      ...reroutableOrderBase,
      exceptions: [{ exceptionType: 'ORDER_ERROR', resolvedAt: new Date() }]
    });

    await userEvent.click(await screen.findByRole('button', { name: /change pharmacy/i }));

    expect(
      await screen.findByText('Let us know why you want to change pharmacies')
    ).toBeInTheDocument();
  });
});

const renderAppAtStatusView = async (orderOverrides: Partial<Order> = {}) => {
  const getOrderMock = vi.mocked(getOrder);
  const order = generateOrder({
    id: 'ord_statusViewTestId',
    state: 'PLACED',
    patient: generatePatient(),
    pharmacy: generatePharmacy(),
    fulfillment: {
      type: 'PICK_UP',
      state: ''
    },
    fulfillments: [
      {
        id: '',
        state: 'READY',
        exceptions: [],
        prescription: {
          __typename: undefined,
          id: '',
          daysSupply: undefined,
          dispenseQuantity: 0,
          dispenseUnit: '',
          expirationDate: undefined,
          fillsAllowed: 0,
          treatment: {
            __typename: undefined,
            id: '',
            name: ''
          }
        }
      }
    ],
    fills: [generateFill('test-treatment')],
    discountCards: [],
    ...orderOverrides
  });

  getOrderMock.mockResolvedValue(order);

  const mockToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30';

  const memoryRouter = createMemoryRouter(createRoutesFromElements(routeElements), {
    initialEntries: [`/?orderId=${order.id}&token=${mockToken}`]
  });

  return { render: render(<RouterProvider router={memoryRouter} />), memoryRouter };
};
