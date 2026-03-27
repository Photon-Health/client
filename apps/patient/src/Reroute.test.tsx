import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, vi } from 'vitest';
import { createMemoryRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import {
  generateFill,
  generateFulfillment,
  generateId,
  generateOrder,
  generatePatient,
  generatePharmacy
} from './test-utils/generators';
import { routeElements } from './Routes';
import userEvent from '@testing-library/user-event';
import { text } from './utils/text';

const mockToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30';

vi.mock('./api', () => ({
  geocode: vi.fn().mockResolvedValue({
    lat: 40.7128,
    lng: -74.006,
    address: '123 Main St, New York, NY 10001'
  }),
  getOrder: vi.fn(),
  getPharmacies: vi.fn().mockResolvedValue({ pharmacies: [] }),
  getPharmaciesByLocation: vi.fn().mockResolvedValue({ pharmaciesByLocation: [] }),
  getOfferBundles: vi.fn().mockResolvedValue([]),
  rerouteOrder: vi.fn().mockReturnValue(Promise.resolve(true)),
  setOrderPharmacy: vi.fn(),
  setPreferredPharmacy: vi.fn(),
  triggerDemoNotification: vi.fn(),
  AUTH_HEADER_ERRORS: []
}));

vi.mock('./configs/graphqlClient', () => ({
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
vi.mock('./configs/analytics');
vi.mock('./hooks/usePageAnalytics');
vi.mock('react-ga4');
vi.mock('mixpanel-browser');

vi.mock('./components', async () => {
  const mod = await vi.importActual('./components');
  return {
    ...mod,
    FixedFooter: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="fixed-footer">{children}</div>
    ),
    LocationModal: () => <div data-testid="location-modal">Location Modal</div>,
    PoweredBy: () => <div data-testid="powered-by">Powered By</div>,
    Nav: () => <div>Nav</div>,
    PrescriptionsList: () => <div>PrescriptionsList</div>
  };
});

describe('Rerouting', () => {
  const testFirstPharmacy = generatePharmacy({
    id: generateId('phr_'),
    name: 'The Original Pharmacy'
  });
  const testSecondPharmacy = generatePharmacy({ id: generateId('phr_'), name: 'The New Pharmacy' });

  const testPatient = generatePatient({ name: { full: 'Jane Doe' } });
  const testFill = generateFill('test-treatment');
  const testFulfillment = generateFulfillment({ state: 'PROCESSING' });
  const testOrder = generateOrder({
    id: 'ord_testId777',
    state: 'PLACED',
    patient: testPatient,
    fills: [testFill],
    fulfillments: [testFulfillment],
    pharmacy: testFirstPharmacy,
    isReroutable: true,
    exceptions: [
      {
        exceptionType: 'ORDER_ERROR'
      }
    ]
  });
  testOrder.organization.settings = {
    brandColor: '#af349d',
    patientUx: {
      enablePatientRerouting: true
    }
  };

  beforeAll(async () => {
    const { getPharmaciesByLocation, setOrderPharmacy, getOrder } = await import('./api');

    const getOrderMock = vi.mocked(getOrder);
    getOrderMock.mockResolvedValue(testOrder);

    const getPharmaciesMock = vi.mocked(getPharmaciesByLocation);
    getPharmaciesMock.mockResolvedValue({
      pharmaciesByLocation: [testFirstPharmacy, testSecondPharmacy]
    });

    const setOrderPharmacyMock = vi.mocked(setOrderPharmacy);
    setOrderPharmacyMock.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('Navigates to pharmacy selection, chooses a new pharmacy to reroute to, and goes to the status page with new pharmacy info and order exceptions optimistically updated', async () => {
    renderApp();

    // shows the current order error status
    expect(await screen.findByText(/order error/i)).toBeInTheDocument();

    // has ability to reroute
    const rerouteButton = await screen.findByText(/change pharmacy/i);
    expect(rerouteButton).toBeInTheDocument();
    await userEvent.click(rerouteButton);

    // moves to pharmacy selection page
    expect(await screen.findByText(text.changePharmacy)).toBeInTheDocument();

    // shows the current pharmacy with current pharmacy tag
    const pharmacyInfos = await screen.findAllByTestId('pharmacy-info');
    for (const pharmacyInfo of pharmacyInfos) {
      const pharmacyName = pharmacyInfo.querySelector(`[data-testid="pharmacy-info-name"]`);
      const currentPharmacyTag = pharmacyInfo.querySelector(
        `[data-testid="pharmacy-info-current-pharmacy"]`
      );
      if (pharmacyName?.textContent?.includes(testFirstPharmacy.name)) {
        expect(currentPharmacyTag).toBeInTheDocument();
      } else {
        expect(currentPharmacyTag).toBeNull();
      }
    }
    expect(await screen.findByText(testFirstPharmacy.name)).toBeInTheDocument();

    // shows the select pharmacy button after clicking on a pharmacy option
    const newPharmacyOption = await screen.findByText(testSecondPharmacy.name);
    expect(newPharmacyOption).toBeInTheDocument();
    await userEvent.click(newPharmacyOption);
    const selectPharmacyButton = await screen.findByText(text.selectPharmacy);
    expect(selectPharmacyButton).toBeVisible();

    // loads and shows a thank you message
    await userEvent.click(selectPharmacyButton);
    await waitFor(() => screen.findByText(text.thankYou), { timeout: 3000 });

    // returns to the status page with the updated pharmacy and cleared exceptions
    await waitFor(() => screen.findByText(/preparing order/i), { timeout: 3000 });
    expect(await screen.findByText(testSecondPharmacy.name)).toBeInTheDocument();
  });
});

const renderApp = () => {
  const memoryRouter = createMemoryRouter(createRoutesFromElements(routeElements), {
    initialEntries: [`/status?orderId=ord_testId777&token=${mockToken}`]
  });

  return { render: render(<RouterProvider router={memoryRouter} />), memoryRouter };
};
