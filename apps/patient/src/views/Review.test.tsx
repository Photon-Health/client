import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { routeElements } from '../Routes';
import {
  generateAddress,
  generateFill,
  generateOrder,
  generatePatient
} from '../test-utils/generators';

const mockToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30';

// Mock API functions
const mockUpdatePatientAddress = vi.fn();
const mockUpdateOrderAddress = vi.fn();
const mockGetOrder = vi.fn();

vi.mock('../api', () => ({
  getOrder: (...args: unknown[]) => mockGetOrder(...args),
  updatePatientAddress: (...args: unknown[]) => mockUpdatePatientAddress(...args),
  updateOrderAddress: (...args: unknown[]) => mockUpdateOrderAddress(...args),
  geocode: vi.fn().mockResolvedValue({
    lat: 40.7128,
    lng: -74.006,
    address: '123 Main St, New York, NY 10001'
  }),
  getPharmacies: vi.fn().mockResolvedValue({ pharmacies: [] }),
  getPharmaciesByLocation: vi.fn().mockResolvedValue({ pharmaciesByLocation: [] }),
  getOfferBundles: vi.fn().mockResolvedValue([]),
  AUTH_HEADER_ERRORS: []
}));

vi.mock('../views/pharmacy.utils', () => ({
  fetchOfferBundles: vi.fn().mockResolvedValue([]),
  getPharmacy: vi.fn().mockReturnValue({
    type: 'PICKUP',
    selectedPharmacy: { id: 'phr_test', name: 'Test Pharmacy' }
  })
}));

vi.mock('../configs/graphqlClient', () => ({
  setAuthHeader: vi.fn(),
  graphQLClient: {
    request: vi.fn().mockResolvedValue({})
  },
  gqlSerializer: {
    parse: vi.fn(),
    stringify: vi.fn()
  }
}));

vi.mock('../hooks/usePageAnalytics');
vi.mock('react-ga4');
vi.mock('mixpanel-browser');

vi.mock('../components', async () => {
  const mod = await vi.importActual('../components');
  return {
    ...mod,
    FixedFooter: ({ children, show }: { children: React.ReactNode; show: boolean }) =>
      show ? <div data-testid="fixed-footer">{children}</div> : null,
    PoweredBy: () => <div data-testid="powered-by">Powered By</div>,
    Nav: () => <div data-testid="nav">Nav</div>,
    PrescriptionsList: () => <div data-testid="prescriptions-list">PrescriptionsList</div>
  };
});

describe('Review Page - Address Form', () => {
  const testFill = generateFill('Test Medication');

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mocks to default behavior
    mockUpdatePatientAddress.mockReset();
    mockUpdateOrderAddress.mockReset();
    mockGetOrder.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('when patient does not have an address', () => {
    const patientWithoutAddress = generatePatient({
      id: 'pat_test456',
      name: { full: 'Jane Doe' },
      address: undefined
    });

    const orderWithoutPatientAddress = generateOrder({
      id: 'ord_test456',
      state: 'ROUTING',
      patient: patientWithoutAddress,
      fills: [testFill]
    });

    beforeEach(() => {
      mockGetOrder.mockResolvedValue(orderWithoutPatientAddress);
    });

    it('shows the address form', async () => {
      renderApp('ord_test456');

      await waitFor(() => {
        expect(screen.getByText('Review your prescription')).toBeInTheDocument();
      });

      // Address form should be present
      expect(screen.getByText('Add your address')).toBeInTheDocument();
      expect(screen.getByText('Required to find nearby pharmacies')).toBeInTheDocument();

      // Form fields should be present
      expect(screen.getByLabelText(/street address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/state/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/zip code/i)).toBeInTheDocument();
    });

    it('shows validation errors when submitting empty form', async () => {
      renderApp('ord_test456');

      await waitFor(() => {
        expect(screen.getByText('Add your address')).toBeInTheDocument();
      });

      // Click the search button without filling the form
      const searchButton = screen.getByRole('button', { name: /search for a pharmacy/i });
      await userEvent.click(searchButton);

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText('Street address is required')).toBeInTheDocument();
      });
      expect(screen.getByText('City is required')).toBeInTheDocument();
      expect(screen.getByText('State is required')).toBeInTheDocument();
      expect(screen.getByText('ZIP code is required')).toBeInTheDocument();

      // Should not have called the API
      expect(mockUpdatePatientAddress).not.toHaveBeenCalled();
    });

    it('shows validation error for invalid ZIP code', async () => {
      renderApp('ord_test456');

      await waitFor(() => {
        expect(screen.getByText('Add your address')).toBeInTheDocument();
      });

      const streetInput = screen.getByLabelText(/street address/i);
      await userEvent.clear(streetInput);
      await userEvent.type(streetInput, '123 Test St');
      await userEvent.type(screen.getByLabelText(/city/i), 'New York');
      await userEvent.selectOptions(screen.getByLabelText(/state/i), 'NY');
      const zipInput = screen.getByLabelText(/zip code/i);
      await userEvent.clear(zipInput);
      await userEvent.type(zipInput, 'invalid');

      const searchButton = screen.getByRole('button', { name: /search for a pharmacy/i });
      await userEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid ZIP code')).toBeInTheDocument();
      });

      expect(mockUpdatePatientAddress).not.toHaveBeenCalled();
    }, 10_000);

    it('submits address and navigates to pharmacy page on success', async () => {
      const updatedPatient = {
        ...patientWithoutAddress,
        address: generateAddress({ id: 'addr_new123' })
      };

      mockUpdatePatientAddress.mockResolvedValue({
        id: patientWithoutAddress.id,
        address: { id: 'addr_new123' }
      });
      mockUpdateOrderAddress.mockResolvedValue({
        id: orderWithoutPatientAddress.id,
        address: { id: 'addr_new123' }
      });

      // After address is saved, return order with patient address
      mockGetOrder.mockResolvedValueOnce(orderWithoutPatientAddress).mockResolvedValueOnce({
        ...orderWithoutPatientAddress,
        patient: updatedPatient
      });

      const { memoryRouter } = renderApp('ord_test456');

      await waitFor(() => {
        expect(screen.getByText('Add your address')).toBeInTheDocument();
      });

      // Fill in the form
      const streetInput = screen.getByLabelText(/street address/i);
      await userEvent.clear(streetInput);
      await userEvent.type(streetInput, '456 New St');
      await userEvent.type(screen.getByLabelText(/city/i), 'Brooklyn');
      await userEvent.selectOptions(screen.getByLabelText(/state/i), 'NY');
      await userEvent.type(screen.getByLabelText(/zip code/i), '11211');

      const searchButton = screen.getByRole('button', { name: /search for a pharmacy/i });
      await userEvent.click(searchButton);

      // Should call updatePatientAddress
      await waitFor(() => {
        expect(mockUpdatePatientAddress).toHaveBeenCalledWith('pat_test456', {
          street1: '456 New St',
          street2: undefined,
          city: 'Brooklyn',
          state: 'NY',
          postalCode: '11211',
          country: 'US'
        });
      });

      // Should call updateOrderAddress with the address ID
      await waitFor(() => {
        expect(mockUpdateOrderAddress).toHaveBeenCalledWith('ord_test456', 'addr_new123');
      });

      // Should navigate to pharmacy page
      await waitFor(() => {
        expect(memoryRouter.state.location.pathname).toBe('/pharmacy');
      });
    }, 10_000);

    it('shows error message when updatePatientAddress fails', async () => {
      mockUpdatePatientAddress.mockRejectedValue(new Error('Failed to save address'));

      renderApp('ord_test456');

      await waitFor(() => {
        expect(screen.getByText('Add your address')).toBeInTheDocument();
      });

      // Fill in the form
      await userEvent.type(screen.getByLabelText(/street address/i), '456 New St');
      await userEvent.type(screen.getByLabelText(/city/i), 'Brooklyn');
      await userEvent.selectOptions(screen.getByLabelText(/state/i), 'NY');
      await userEvent.type(screen.getByLabelText(/zip code/i), '11211');

      const searchButton = screen.getByRole('button', { name: /search for a pharmacy/i });
      await userEvent.click(searchButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText('Failed to save address')).toBeInTheDocument();
      });

      // Should not have called updateOrderAddress
      expect(mockUpdateOrderAddress).not.toHaveBeenCalled();
    });

    it('shows error message when updateOrderAddress fails', async () => {
      mockUpdatePatientAddress.mockResolvedValue({
        id: patientWithoutAddress.id,
        address: { id: 'addr_new123' }
      });
      mockUpdateOrderAddress.mockRejectedValue(new Error('Failed to update order'));

      renderApp('ord_test456');

      await waitFor(() => {
        expect(screen.getByText('Add your address')).toBeInTheDocument();
      });

      // Fill in the form
      await userEvent.type(screen.getByLabelText(/street address/i), '456 New St');
      await userEvent.type(screen.getByLabelText(/city/i), 'Brooklyn');
      await userEvent.selectOptions(screen.getByLabelText(/state/i), 'NY');
      await userEvent.type(screen.getByLabelText(/zip code/i), '11211');

      const searchButton = screen.getByRole('button', { name: /search for a pharmacy/i });
      await userEvent.click(searchButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText('Failed to update order')).toBeInTheDocument();
      });
    });
  });

  describe('in demo mode', () => {
    it('does not show address form even if patient has no address', async () => {
      // Demo mode uses demoOrder which has address
      const { memoryRouter } = renderDemoApp();

      await waitFor(() => {
        expect(memoryRouter.state.location.pathname).toBe('/review');
      });

      // In demo mode, address form should not show
      expect(screen.queryByText('Add your address')).not.toBeInTheDocument();
    });
  });
});

const renderApp = (orderId: string) => {
  const memoryRouter = createMemoryRouter(createRoutesFromElements(routeElements), {
    initialEntries: [`/?orderId=${orderId}&token=${mockToken}`]
  });

  return { render: render(<RouterProvider router={memoryRouter} />), memoryRouter };
};

const renderDemoApp = () => {
  const memoryRouter = createMemoryRouter(createRoutesFromElements(routeElements), {
    initialEntries: [`/?demo=true`]
  });

  return { render: render(<RouterProvider router={memoryRouter} />), memoryRouter };
};
