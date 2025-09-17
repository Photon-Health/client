import { act, render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Pharmacy } from './Pharmacy';
import { OrderContext, OrderContextType } from './Main';
import { Order } from '../utils/models';
import {
  generateFill,
  generateFlattenedFill,
  generateOrder,
  generatePharmacy,
  generateTreatment
} from '../test-utils/generators';
import userEvent from '@testing-library/user-event';

vi.mock('../api', () => ({
  geocode: vi.fn().mockResolvedValue({
    lat: 40.7128,
    lng: -74.006,
    address: '123 Main St, New York, NY 10001'
  }),
  getPharmacies: vi.fn().mockResolvedValue({ pharmaciesByLocation: [] }),
  rerouteOrder: vi.fn(),
  setOrderPharmacy: vi.fn(),
  setPreferredPharmacy: vi.fn(),
  triggerDemoNotification: vi.fn(),
  getOffers: vi.fn().mockResolvedValue([])
}));

vi.mock('../components', () => ({
  BrandedOptions: () => <div data-testid="branded-options">Branded Options</div>,
  CouponModal: () => <div data-testid="coupon-modal">Coupon Modal</div>,
  FixedFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="fixed-footer">{children}</div>
  ),
  LocationModal: () => <div data-testid="location-modal">Location Modal</div>,
  PoweredBy: () => <div data-testid="powered-by">Powered By</div>
}));

vi.mock('../configs/graphqlClient', () => ({
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

describe('Pharmacy Component', async () => {
  const { getPharmacies } = await import('../api');
  const getPharmaciesMock = vi.mocked(getPharmacies);

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('when pharmacy has coupon and retail price', async () => {
    beforeEach(async () => {
      getPharmaciesMock.mockResolvedValue({
        pharmaciesByLocation: [
          generatePharmacy({ id: 'pharmacy-123', price: 101, retailPrice: 1000 })
        ]
      });

      await renderPharmacy();
    });

    it('should show coupon price', () => {
      expect(screen.getByText('Coupon Price')).toBeInTheDocument();
      expect(screen.getByText('$101')).toBeInTheDocument();
    });

    it('should show retail price', () => {
      expect(screen.getByText('Retail')).toBeInTheDocument();
      expect(screen.getByText('$1000')).toBeInTheDocument();
    });
  });

  describe('when pharmacy has no coupons', async () => {
    beforeEach(async () => {
      getPharmaciesMock.mockResolvedValue({
        pharmaciesByLocation: [
          generatePharmacy({ id: 'pharmacy-123', price: undefined, retailPrice: undefined })
        ]
      });

      await renderPharmacy();
    });

    it('should NOT show coupon or retail prices', () => {
      expect(screen.queryByText('Coupon Price')).not.toBeInTheDocument();
      expect(screen.queryByText('Retail')).not.toBeInTheDocument();
    });
  });

  describe('when prices are enabled', () => {
    beforeEach(async () => {
      await renderPharmacy({
        enablePrice: true,
        showPriceToggle: true
      });

      // Wait for the component to render and API calls to be made
      await new Promise((resolve) => setTimeout(resolve, 100));
    });
    it('shows the price toggle switch', async () => {
      expect(screen.getByRole('checkbox', { name: 'Show coupon card prices' })).toBeInTheDocument();
    });
    it('shows the price toggle text', async () => {
      expect(screen.getByText('Show coupon card prices')).toBeInTheDocument();
    });
    it('does request price immediately', async () => {
      const firstCallArgs = getPharmaciesMock.mock.calls[0][0];
      expect(firstCallArgs.includePrice).toEqual(true);
    });
    it('should show the correct initial toggle state', () => {
      // The toggle should be checked since enablePrice: true in the context
      const checkbox = screen.getByRole('checkbox', { name: 'Show coupon card prices' });
      expect(checkbox).toBeChecked();
    });
  });

  describe('when prices are disabled', () => {
    beforeEach(async () => {
      await renderPharmacy({
        showPriceToggle: false,
        enablePrice: false
      });
    });
    it('hides the price toggle checkbox', async () => {
      expect(
        screen.queryByRole('checkbox', { name: 'Show coupon card prices' })
      ).not.toBeInTheDocument();
    });
    it('hides the price toggle text', async () => {
      expect(screen.queryByText('Show coupon card prices')).not.toBeInTheDocument();
    });
    it('does not request prices', async () => {
      const firstCallArgs = getPharmaciesMock.mock.calls[0][0];
      expect(firstCallArgs.includePrice).toEqual(false);
    });
  });
});

const renderPharmacy = async (orderContextValueOverride: Partial<OrderContextType> = {}) => {
  let component;
  const orderContextValue: OrderContextType = {
    fetchOrder(currentPharmacy: Order['pharmacy'] | undefined) {
      return Promise.resolve(undefined);
    },
    flattenedFills: [],
    isDemo: false,
    logo: undefined,
    order: generateOrder(),
    setFaqModalIsOpen(isOpen: boolean): void {},
    setOrder(order: Order): void {},
    showPriceToggle: true,
    enablePrice: true,
    setEnablePrice: vi.fn(),
    ...orderContextValueOverride
  };
  await act(async () => {
    component = render(
      <MemoryRouter initialEntries={['?token=test-token&orderId=order-123']}>
        <OrderContext.Provider value={orderContextValue}>
          <ChakraProvider>
            <Pharmacy />
          </ChakraProvider>
        </OrderContext.Provider>
      </MemoryRouter>
    );
  });
  return component;
};
