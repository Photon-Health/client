import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { routeElements } from '../Routes';
import { getInfoPageData } from '../api';
import { generatePharmacy } from '../test-utils/generators';
import { FulfillmentType, Organization, Patient, Pharmacy } from '../__generated__/graphql';

// Mock modules before imports
vi.mock('../api', () => ({
  getInfoPageData: vi.fn(),
  AUTH_HEADER_ERRORS: []
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

vi.mock('@datadog/browser-rum');
vi.mock('../configs/analytics');
vi.mock('../hooks/usePageAnalytics');
vi.mock('react-ga4');
vi.mock('mixpanel-browser');

vi.mock('../components', async () => {
  const mod = await vi.importActual('../components');
  return {
    ...mod,
    PharmacyInfo: () => <div data-testid="pharmacy-info">Pharmacy Info</div>,
    Card: ({ children }: { children: React.ReactNode }) => <div data-testid="card">{children}</div>
  };
});

vi.mock('../components/status/Header', () => ({
  OrderStatusHeader: () => <div data-testid="order-status-header">Order Status Header</div>
}));

vi.mock('../components/order-details/OrderDetailsModal', () => ({
  OrderDetailsModal: ({ isOpen }: { isOpen: boolean }) => (
    <div data-testid="order-details-modal">{isOpen ? 'Modal Open' : 'Modal Closed'}</div>
  )
}));

describe('InfoPage', () => {
  const mockPatient: Patient = {
    id: 'pat_test123',
    name: {
      first: 'John',
      last: 'Doe',
      full: 'John Doe'
    },
    dateOfBirth: new Date('1990-01-01'),
    sex: 'MALE',
    phone: '555-555-5555',
    preferredPharmacies: []
  };

  const mockPharmacy: Pharmacy = generatePharmacy({
    id: 'phr_test123',
    name: 'Test Pharmacy',
    phone: '555-123-4567',
    address: {
      street1: '123 Pharmacy St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'US'
    },
    fulfillmentTypes: ['PICK_UP'] as FulfillmentType[]
  });

  const mockOrganization: Organization = {
    id: 'org_test456',
    name: 'Test Organization',
    settings: {
      id: 'set_test123',
      organizationId: 'org_test456',
      brandColor: '#0000FF',
      brandLogo: 'https://example.com/logo.png',
      patientUx: {}
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Image constructor for logo preloading
    global.Image = class {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src = '';

      constructor() {
        setTimeout(() => {
          if (this.onload) {
            this.onload();
          }
        }, 0);
      }
    } as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    const getInfoPageDataMock = vi.mocked(getInfoPageData);
    getInfoPageDataMock.mockImplementation(
      () => new Promise(() => {}) // Never resolves to keep loading
    );

    renderApp();

    expect(await screen.findByRole('progressbar')).toBeInTheDocument();
  });

  it('renders info page with pharmacy and order details', async () => {
    const getInfoPageDataMock = vi.mocked(getInfoPageData);
    getInfoPageDataMock.mockResolvedValue({
      me: mockPatient,
      pharmacy: mockPharmacy,
      organization: mockOrganization
    });

    renderApp();

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Check for pharmacy section
    expect(await screen.findByText('Pharmacy')).toBeInTheDocument();
    expect(screen.getByTestId('pharmacy-info')).toBeInTheDocument();

    // Check for order summary section
    expect(screen.getByText('Order Summary')).toBeInTheDocument();
    expect(screen.getByText('Lisinopril')).toBeInTheDocument();
  });

  it('displays pharmacy contact buttons', async () => {
    const getInfoPageDataMock = vi.mocked(getInfoPageData);
    getInfoPageDataMock.mockResolvedValue({
      me: mockPatient,
      pharmacy: mockPharmacy,
      organization: mockOrganization
    });

    renderApp();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Check for call pharmacy button
    const callButton = screen.getByRole('link', { name: /call pharmacy/i });
    expect(callButton).toBeInTheDocument();
    expect(callButton).toHaveAttribute('href', 'tel:555-123-4567');

    // Check for directions button
    const directionsButton = screen.getByRole('link', { name: /directions/i });
    expect(directionsButton).toBeInTheDocument();
    expect(directionsButton.getAttribute('href')).toContain('maps.google.com');
  });

  it('opens order details modal when clicking view details', async () => {
    const getInfoPageDataMock = vi.mocked(getInfoPageData);
    getInfoPageDataMock.mockResolvedValue({
      me: mockPatient,
      pharmacy: mockPharmacy,
      organization: mockOrganization
    });

    renderApp();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const viewDetailsButton = screen.getByRole('button', { name: 'View Details' });
    expect(viewDetailsButton).toBeInTheDocument();

    await userEvent.click(viewDetailsButton);

    // Modal should be open
    expect(screen.getByText('Modal Open')).toBeInTheDocument();
  });

  it('displays organization logo when available', async () => {
    const getInfoPageDataMock = vi.mocked(getInfoPageData);
    getInfoPageDataMock.mockResolvedValue({
      me: mockPatient,
      pharmacy: mockPharmacy,
      organization: mockOrganization
    });

    renderApp();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const logo = screen.getByRole('img');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', 'https://example.com/logo.png');
  });

  it('navigates to no-match on invalid token', async () => {
    const invalidToken = 'invalid.token.here';

    const memoryRouter = createMemoryRouter(createRoutesFromElements(routeElements), {
      initialEntries: [`/info?token=${invalidToken}`]
    });

    render(<RouterProvider router={memoryRouter} />);

    // Should redirect to /no-match
    await waitFor(() => {
      expect(memoryRouter.state.location.pathname).toBe('/no-match');
    });
  });

  it('displays order status header with correct status', async () => {
    const getInfoPageDataMock = vi.mocked(getInfoPageData);
    getInfoPageDataMock.mockResolvedValue({
      me: mockPatient,
      pharmacy: mockPharmacy,
      organization: mockOrganization
    });

    renderApp();

    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('order-status-header')).toBeInTheDocument();
  });

  it('navigates to no-match when data fails to load', async () => {
    const getInfoPageDataMock = vi.mocked(getInfoPageData);
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    getInfoPageDataMock.mockRejectedValue(new Error('Failed to fetch data'));

    const mockToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaGFybWFjeUlkIjoicGhyX3Rlc3QxMjMiLCJvcmdhbml6YXRpb25JZCI6Im9yZ190ZXN0NDU2IiwicHJlc2NyaXB0aW9ucyI6W3sidHJlYXRtZW50Ijp7ImlkIjoibWVkXzEyMyIsIm5hbWUiOiJMaXNpbm9wcmlsIn0sImRpc3BlbnNlUXVhbnRpdHkiOjMwLCJkaXNwZW5zZVVuaXQiOiJ0YWJsZXRzIiwiZGF5c1N1cHBseSI6MzAsImV4cGlyZXNBdCI6IjIwMjUtMTItMzFUMjM6NTk6NTlaIiwicmVmaWxsc0FsbG93ZWQiOjN9XX0.signature';

    const memoryRouter = createMemoryRouter(createRoutesFromElements(routeElements), {
      initialEntries: [`/info?token=${mockToken}`]
    });

    render(<RouterProvider router={memoryRouter} />);

    // Should redirect to /no-match after failing to fetch data
    await waitFor(() => {
      expect(memoryRouter.state.location.pathname).toBe('/no-match');
    });

    // Should also log the error
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to fetch data',
        expect.objectContaining({ err: expect.any(Error) })
      );
    });

    consoleErrorSpy.mockRestore();
  });
});

const renderApp = () => {
  const mockToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaGFybWFjeUlkIjoicGhyX3Rlc3QxMjMiLCJvcmdhbml6YXRpb25JZCI6Im9yZ190ZXN0NDU2IiwicHJlc2NyaXB0aW9ucyI6W3sidHJlYXRtZW50Ijp7ImlkIjoibWVkXzEyMyIsIm5hbWUiOiJMaXNpbm9wcmlsIn0sImRpc3BlbnNlUXVhbnRpdHkiOjMwLCJkaXNwZW5zZVVuaXQiOiJ0YWJsZXRzIiwiZGF5c1N1cHBseSI6MzAsImV4cGlyZXNBdCI6IjIwMjUtMTItMzFUMjM6NTk6NTlaIiwicmVmaWxsc0FsbG93ZWQiOjN9XX0.signature';

  const memoryRouter = createMemoryRouter(createRoutesFromElements(routeElements), {
    initialEntries: [`/info?token=${mockToken}`]
  });

  return { render: render(<RouterProvider router={memoryRouter} />), memoryRouter };
};
