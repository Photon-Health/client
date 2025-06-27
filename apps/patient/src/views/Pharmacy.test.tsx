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
  triggerDemoNotification: vi.fn()
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

  describe('default page state', async () => {
    beforeEach(async () => {
      getPharmaciesMock.mockResolvedValue({
        pharmaciesByLocation: [generatePharmacy({ id: 'test-pharmacy-123' })]
      });

      await renderPharmacy();
    });

    it('should request pharmacies with prices', async () => {
      const firstCallArgs = getPharmaciesMock.mock.calls[0][0];
      expect(firstCallArgs.includePrice).toEqual(true);
    });

    it('should request pharmacies without prices on toggle click', async () => {
      getPharmaciesMock.mockClear();
      await userEvent.click(screen.getByRole('checkbox', { name: 'Show coupon card prices' }));
      const recentCallArgs = getPharmaciesMock.mock.calls[0][0];
      expect(recentCallArgs.includePrice).toEqual(false);
    });
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

  describe('showPriceToggle visibility', () => {
    describe('when order has single non-GLP medication', () => {
      beforeEach(async () => {
        const singleNonGLPFill = [generateFill('Metformin')];
        const order = generateOrder({ fills: singleNonGLPFill });

        await renderPharmacy({ order });
      });

      it('shows the price toggle switch', async () => {
        expect(
          screen.getByRole('checkbox', { name: 'Show coupon card prices' })
        ).toBeInTheDocument();
      });

      it('shows the price toggle text', async () => {
        expect(screen.getByText('Show coupon card prices')).toBeInTheDocument();
      });
    });

    describe('when order contains GLP-1 medication', () => {
      beforeEach(async () => {
        const glp1MedicationName = 'Semaglutide';
        const glpFill = generateFlattenedFill({
          treatment: generateTreatment({ name: glp1MedicationName })
        });

        await renderPharmacy({ flattenedFills: [glpFill] });
      });
      it('hides the price toggle checkbox', async () => {
        expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
      });
      it('hides the price toggle text', async () => {
        expect(screen.queryByText('Show coupon card prices')).not.toBeInTheDocument();
      });
    });

    describe('when order has multiple prescriptions', () => {
      beforeEach(async () => {
        const multipleFills = [
          generateFlattenedFill({
            treatment: generateTreatment({ name: 'Metformin' })
          }),
          generateFlattenedFill({
            treatment: generateTreatment({ name: 'Lisinopril' })
          })
        ];

        await renderPharmacy({ flattenedFills: multipleFills });
      });
      it('hides the price toggle checkbox', async () => {
        expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
      });
      it('hides the price toggle text', async () => {
        expect(screen.queryByText('Show coupon card prices')).not.toBeInTheDocument();
      });
    });

    describe('when order has multiple prescriptions including GLP-1', () => {
      beforeEach(async () => {
        const glp1MedicationName = 'Ozempic';
        const multipleFillsWithGLP = [
          generateFlattenedFill({
            treatment: generateTreatment({ name: 'Metformin' })
          }),
          generateFlattenedFill({
            treatment: generateTreatment({ name: glp1MedicationName })
          })
        ];

        await renderPharmacy({ flattenedFills: multipleFillsWithGLP });
      });
      it('hides the price toggle checkbox', async () => {
        expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
      });
      it('hides the price toggle text', async () => {
        expect(screen.queryByText('Show coupon card prices')).not.toBeInTheDocument();
      });
    });
  });
});

const renderPharmacy = async (orderContextValueOverride: Partial<OrderContextType> = {}) => {
  let component;
  const orderContextValue: OrderContextType = {
    fetchOrder(currentPharmacy: Order['pharmacy'] | undefined): void {},
    flattenedFills: [],
    isDemo: false,
    logo: undefined,
    order: generateOrder(),
    setFaqModalIsOpen(isOpen: boolean): void {},
    setOrder(order: Order): void {},
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
