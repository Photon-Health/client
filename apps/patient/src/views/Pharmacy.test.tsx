import { act, render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Pharmacy } from './Pharmacy';
import { OrderContext, OrderContextType } from './Main';
import { Order } from '../utils/models';
import { generateOrder } from '../test-utils/generators';

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
  PickupOptions: () => <div data-testid="pickup-options">Pickup Options</div>,
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

describe('Pharmacy Component - Switch Visibility', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('showPriceToggle visibility', () => {
    describe('when order has single non-GLP medication', () => {
      beforeEach(async () => {
        const singleNonGLPFill = [generateFill('Metformin')];
        const order = generateOrder({ fills: singleNonGLPFill });

        await renderPharmacy({ order });
      });

      it('shows the price toggle switch', async () => {
        expect(screen.getByRole('checkbox')).toBeInTheDocument();
      });

      it('shows the price toggle text', async () => {
        expect(screen.getByText('Show coupon card prices')).toBeInTheDocument();
      });
    });

    describe('when order contains GLP-1 medication', () => {
      beforeEach(async () => {
        const glp1MedicationName = 'Semaglutide';
        const glpFill = [generateFill(glp1MedicationName)];

        await renderPharmacy({ flattenedFills: glpFill });
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
        const multipleFills = [generateFill('Metformin'), generateFill('Lisinopril')];

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
        const multipleFillsWithGLP = [generateFill('Metformin'), generateFill(glp1MedicationName)];

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

const generateFill = (treatmentName: string) => ({
  id: `fill-${treatmentName}`,
  treatment: {
    id: `treatment-${treatmentName}`,
    name: treatmentName
  },
  count: 1
});
