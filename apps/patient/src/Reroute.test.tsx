import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, vi } from 'vitest';
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

vi.mock('./views/pharmacy.utils', async () => {
  const actual = await vi.importActual<typeof import('./views/pharmacy.utils')>(
    './views/pharmacy.utils'
  );
  return {
    ...actual,
    fetchOfferBundles: vi.fn().mockResolvedValue([])
  };
});

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

  beforeEach(async () => {
    const { getPharmaciesByLocation, setOrderPharmacy, getOrder, rerouteOrder } = await import(
      './api'
    );

    vi.mocked(getOrder).mockResolvedValue(testOrder);

    vi.mocked(getPharmaciesByLocation).mockResolvedValue({
      pharmaciesByLocation: [testFirstPharmacy, testSecondPharmacy]
    });

    vi.mocked(setOrderPharmacy).mockResolvedValue(true);
    vi.mocked(rerouteOrder).mockResolvedValue(true);

    const { fetchOfferBundles } = await import('./views/pharmacy.utils');
    vi.mocked(fetchOfferBundles).mockResolvedValue([]);
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
    expect(await screen.findByRole('heading', { name: 'Choose a Pharmacy' })).toBeInTheDocument();

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
    expect(screen.queryByTestId('pharmacy-sent-here-badge')).not.toBeInTheDocument();
    expect(await screen.findByText(testFirstPharmacy.name)).toBeInTheDocument();

    // shows the select pharmacy button after clicking on a pharmacy option
    const newPharmacyOption = await screen.findByText(testSecondPharmacy.name);
    expect(newPharmacyOption).toBeInTheDocument();
    await userEvent.click(newPharmacyOption);
    const selectPharmacyButton = await screen.findByText(text.selectPharmacy);
    expect(selectPharmacyButton).toBeVisible();

    // loads and shows a thank you message
    // NOTE: intentionally not awaiting here - handleSubmit navigates away as part of its
    // function body, so awaiting the click would block execution until after navigation
    // and we'd never observe the intermediate "Thank you!" render.
    userEvent.click(selectPharmacyButton);
    await waitFor(() => screen.findByText(text.thankYou), { timeout: 3000 });

    // returns to the status page with the updated pharmacy and cleared exceptions
    await waitFor(() => screen.findByText(/preparing order/i), { timeout: 3000 });
    expect(await screen.findByText(testSecondPharmacy.name)).toBeInTheDocument();
  }, 15_000);
});

const renderApp = (initialPath = `/status?orderId=ord_testId777&token=${mockToken}`) => {
  const memoryRouter = createMemoryRouter(createRoutesFromElements(routeElements), {
    initialEntries: [initialPath]
  });

  return { render: render(<RouterProvider router={memoryRouter} />), memoryRouter };
};
