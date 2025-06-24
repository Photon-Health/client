import { render, screen, act } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Pharmacy } from './Pharmacy';
import { useOrderContext } from './Main';

vi.mock('./Main', () => ({
  useOrderContext: vi.fn()
}));

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

vi.mock('react-ga4', () => ({
  event: vi.fn()
}));

vi.mock('@datadog/browser-rum', () => ({
  datadogRum: {
    addAction: vi.fn()
  }
}));

vi.mock('@client/settings', () => ({
  getOrgMailOrderPharms: vi.fn(() => ({ patient: [] }))
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

const mockUseOrderContext = vi.mocked(useOrderContext);

const createMockOrder = (fills: any[] = [], organizationSettings: any = {}) => ({
  id: 'order-123',
  patient: { id: 'patient-123', name: { full: 'John Doe' } },
  organization: {
    id: 'org-123',
    name: 'Test Org',
    settings: {
      patientUx: organizationSettings
    }
  },
  address: {
    street1: '123 Main St',
    city: 'New York',
    state: 'NY',
    postalCode: '10001'
  },
  fills,
  readyBy: 'Regular',
  pharmacy: null
});

const createMockFill = (treatmentName: string) => ({
  id: `fill-${treatmentName}`,
  treatment: {
    id: `treatment-${treatmentName}`,
    name: treatmentName
  },
  count: 1
});

const renderPharmacy = async (searchParams = '?token=test-token&orderId=order-123') => {
  let component;
  await act(async () => {
    component = render(
      <MemoryRouter initialEntries={[searchParams]}>
        <ChakraProvider>
          <Pharmacy />
        </ChakraProvider>
      </MemoryRouter>
    );
  });
  return component;
};

describe('Pharmacy Component - Switch Visibility', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('showPriceToggle visibility', () => {
    it('shows the price toggle switch when order has single non-GLP medication', async () => {
      const singleNonGLPFill = [createMockFill('Metformin')];
      const mockOrder = createMockOrder(singleNonGLPFill);

      mockUseOrderContext.mockReturnValue({
        order: mockOrder,
        flattenedFills: singleNonGLPFill,
        setOrder: vi.fn(),
        isDemo: false,
        fetchOrder: vi.fn(),
        logo: null,
        setFaqModalIsOpen: vi.fn()
      } as any);

      await renderPharmacy();

      expect(screen.getByRole('checkbox')).toBeInTheDocument();
      expect(screen.getByText('Show coupon card prices')).toBeInTheDocument();
    });

    it('hides the price toggle switch when order contains GLP-1 medication', async () => {
      const glp1MedicationName = 'Semaglutide';
      const glpFill = [createMockFill(glp1MedicationName)];
      const mockOrder = createMockOrder(glpFill);

      mockUseOrderContext.mockReturnValue({
        order: mockOrder,
        flattenedFills: glpFill,
        setOrder: vi.fn(),
        isDemo: false,
        fetchOrder: vi.fn(),
        logo: null,
        setFaqModalIsOpen: vi.fn()
      } as any);

      await renderPharmacy();

      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
      expect(screen.queryByText('Show coupon card prices')).not.toBeInTheDocument();
    });

    it('hides the price toggle switch when order has multiple prescriptions', async () => {
      const multipleFills = [createMockFill('Metformin'), createMockFill('Lisinopril')];
      const mockOrder = createMockOrder(multipleFills);

      mockUseOrderContext.mockReturnValue({
        order: mockOrder,
        flattenedFills: multipleFills,
        setOrder: vi.fn(),
        isDemo: false,
        fetchOrder: vi.fn(),
        logo: null,
        setFaqModalIsOpen: vi.fn()
      } as any);

      await renderPharmacy();

      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
      expect(screen.queryByText('Show coupon card prices')).not.toBeInTheDocument();
    });

    it('hides the price toggle switch when order has multiple prescriptions including GLP-1', async () => {
      const glp1MedicationName = 'Ozempic';
      const multipleFillsWithGLP = [
        createMockFill('Metformin'),
        createMockFill(glp1MedicationName)
      ];
      const mockOrder = createMockOrder(multipleFillsWithGLP);

      mockUseOrderContext.mockReturnValue({
        order: mockOrder,
        flattenedFills: multipleFillsWithGLP,
        setOrder: vi.fn(),
        isDemo: false,
        fetchOrder: vi.fn(),
        logo: null,
        setFaqModalIsOpen: vi.fn()
      } as any);

      await renderPharmacy();

      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
      expect(screen.queryByText('Show coupon card prices')).not.toBeInTheDocument();
    });
  });
});
