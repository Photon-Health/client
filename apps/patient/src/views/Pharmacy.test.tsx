// Set environment variable BEFORE any imports
import.meta.env.VITE_AMAZON_PHARMACY_ID = 'phr_01GA9HPV5XYTC1NNX213VRRBZ3';

import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, MockedFunction, vi } from 'vitest';
import { createMemoryRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import {
  generateFill,
  generateFulfillment,
  generateId,
  generateOrder,
  generatePatient,
  generatePharmacy
} from '../test-utils/generators';
import userEvent from '@testing-library/user-event';
import { routeElements } from '../Routes';
import {
  getOrder,
  getPharmacies,
  getPharmaciesByLocation,
  rerouteOrder,
  setOrderPharmacy
} from '../api';
import { fetchPharmacyOffers, getPharmacy } from './pharmacy.utils';
import { FulfillmentType, Pharmacy } from '../__generated__/graphql';
import { Order, PharmacyOffer } from '../utils/models';
import {
  hasConfirmedAutoroutedPharmacy,
  markAutoroutedPharmacyConfirmed
} from '../utils/autoroutedPharmacyConfirmationStorage';
import { text } from '../utils/text';
import { getPatientAnalytics } from '../configs/analytics';

// react-intersection-observer's test-utils swaps in a vi.fn whose arrow implementation can't be
// constructed, so we drive a real observer stub instead
const observers = new Set<{ cb: IntersectionObserverCallback; elements: Set<Element> }>();

class MockIntersectionObserver {
  private entry = {
    cb: (() => undefined) as IntersectionObserverCallback,
    elements: new Set<Element>()
  };

  constructor(cb: IntersectionObserverCallback) {
    this.entry.cb = cb;
    observers.add(this.entry);
  }
  observe(element: Element) {
    this.entry.elements.add(element);
  }
  unobserve(element: Element) {
    this.entry.elements.delete(element);
  }
  disconnect() {
    observers.delete(this.entry);
  }
  takeRecords() {
    return [];
  }
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

const scrollCardsIntoView = () =>
  act(() => {
    observers.forEach(({ cb, elements }) =>
      elements.forEach((target) =>
        cb(
          [{ target, isIntersecting: true, intersectionRatio: 1 } as IntersectionObserverEntry],
          null as never
        )
      )
    );
  });

const offerImpressions = () =>
  vi
    .mocked(getPatientAnalytics().track)
    .mock.calls.filter(([event]) => event === 'Offer Impression')
    .map(([, , properties]) => properties ?? {});

// Mock the settings and pharmacy utils before any imports
vi.mock('@client/settings', () => ({
  getOrgMailOrderPharms: vi.fn().mockReturnValue({
    patient: [
      'phr_01GA9HPV5XYTC1NNX213VRRBZ3',
      'phr_01GA9HPV5XYTC1NNX213VRRBZ4',
      'phr_01GA9HPV5XYTC1NNX213VRRBZ5'
    ]
  })
}));

const mockToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30';

vi.mock('../api', () => ({
  geocode: vi.fn().mockResolvedValue({
    lat: 40.7128,
    lng: -74.006,
    address: '123 Main St, New York, NY 10001'
  }),
  getOrder: vi.fn(),
  getPharmaciesByLocation: vi.fn().mockResolvedValue({ pharmaciesByLocation: [] }),
  getPharmacies: vi.fn().mockResolvedValue({ pharmacies: [] }),
  getOfferBundles: vi.fn().mockResolvedValue([]),
  rerouteOrder: vi.fn(),
  setOrderPharmacy: vi.fn(),
  setPreferredPharmacy: vi.fn(),
  triggerDemoNotification: vi.fn(),
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

vi.mock('./pharmacy.utils', () => ({
  fetchPharmacyOffers: vi.fn(),
  getPharmacy: vi.fn()
}));

vi.mock('../hooks/usePageAnalytics');
vi.mock('react-ga4');
vi.mock('mixpanel-browser');

vi.mock('../components', async () => {
  const mod = await vi.importActual('../components');
  return {
    ...mod,
    FixedFooter: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="fixed-footer">{children}</div>
    ),
    LocationModal: () => <div data-testid="location-modal">Location Modal</div>,
    InsuranceModal: () => <div data-testid="insurance-modal">Insurance Modal</div>,
    PoweredBy: () => <div data-testid="powered-by">Powered By</div>,
    Nav: () => <div>Nav</div>,
    PrescriptionsList: () => <div>PrescriptionsList</div>
  };
});

describe('Pharmacy page', () => {
  beforeEach(async () => {
    const { geocode, getPharmaciesByLocation } = await import('../api');
    vi.mocked(geocode).mockResolvedValue({
      lat: 40.7128,
      lng: -74.006,
      address: '123 Main St, New York, NY 10001'
    });
    vi.mocked(getPharmaciesByLocation).mockResolvedValue({ pharmaciesByLocation: [] });

    const { fetchPharmacyOffers, getPharmacy } = await import('./pharmacy.utils');
    vi.mocked(fetchPharmacyOffers).mockResolvedValue([]);
    vi.mocked(getPharmacy).mockReturnValue({
      type: 'MAIL_ORDER',
      selectedPharmacy: { id: 'amazon_pharmacy_id', name: 'Amazon Pharmacy' }
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('offers', async () => {
    let fetchPharmacyOffersMock: MockedFunction<typeof fetchPharmacyOffers>;
    let getPharmacyMock: MockedFunction<typeof getPharmacy>;
    let getOrderMock: MockedFunction<typeof getOrder>;

    const mockOfferBundles: PharmacyOffer[] = [
      {
        source: 'AMAZON_PHARMACY',
        isPromoted: true,
        deliveryEstimate: 'Delivers in 1-2 days',
        pricing: {
          costAmount: 19.99,
          costAmountTitle: 'Prime Rx Price',
          retailAmount: 120.0,
          retailAmountTitle: 'Retail'
        },
        pharmacy: {
          id: 'phr_01GA9HPV5XYTC1NNX213VRRBZ3',
          name: 'Amazon Pharmacy',
          fulfillmentTypes: ['MAIL_ORDER']
        },
        tags: [
          { kind: 'IN_STOCK', label: 'In Stock' },
          { kind: 'FREE_DELIVERY', label: 'Free Shipping' }
        ],
        prescriptions: [{ name: 'Metformin 500mg', amount: 19.99, retailAmount: 120.0 }]
      }
    ];

    beforeEach(async () => {
      fetchPharmacyOffersMock = vi.mocked(fetchPharmacyOffers);
      fetchPharmacyOffersMock.mockResolvedValue(mockOfferBundles);

      getPharmacyMock = vi.mocked(getPharmacy);
      getPharmacyMock.mockReturnValue({
        type: 'MAIL_ORDER',
        selectedPharmacy: { id: 'amazon_pharmacy_id', name: 'Amazon Pharmacy' }
      });

      getOrderMock = vi.mocked(getOrder);
    });
    test('shows offers when they are available and price is enabled', async () => {
      const singlePrescriptionOrder = generateOrder({
        id: 'ord_testId777',
        state: 'ROUTING',
        patient: generatePatient(),
        fills: [generateFill('test-treatment')],
        address: {
          street1: '123 Main St',
          street2: undefined,
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US'
        }
      });
      getOrderMock.mockResolvedValue(singlePrescriptionOrder);

      const getPharmaciesByLocationMock = vi.mocked(getPharmaciesByLocation);
      getPharmaciesByLocationMock.mockResolvedValue({
        pharmaciesByLocation: [
          generatePharmacy({
            id: 'phr_testId123',
            name: 'Test Local Pickup Pharmacy',
            price: 444,
            retailPrice: 1000
          })
        ]
      });

      const setOrderPharmacyMock = vi.mocked(setOrderPharmacy);
      setOrderPharmacyMock.mockResolvedValue(true);

      renderApp();
      await navigateToPharmacyScreen();

      // Price is already enabled by default, so offers should show
      // Wait for offers to load and check they are displayed
      expect(await screen.findByText('Amazon Pharmacy')).toBeInTheDocument();
      expect(await screen.findByText('Delivers in 1-2 days')).toBeInTheDocument();
      expect(await screen.findByText('$19.99')).toBeInTheDocument();
      expect(await screen.findByText('Prime Rx Price')).toBeInTheDocument();
    }, 10_000);

    test('shows insurance and coupon prices on one card with separate impressions', async () => {
      getOrderMock.mockResolvedValue(
        generateOrder({
          id: 'ord_testId777',
          state: 'ROUTING',
          patient: generatePatient(),
          fills: [generateFill('test-treatment')],
          address: {
            street1: '123 Main St',
            street2: undefined,
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            country: 'US'
          }
        })
      );
      fetchPharmacyOffersMock.mockResolvedValue([
        {
          source: 'ARRIVE',
          isPromoted: false,
          pricing: { costAmount: 12, costAmountTitle: 'With insurance' },
          pharmacy: {
            id: 'phr_insured',
            name: 'Northside Pharmacy',
            fulfillmentTypes: ['PICK_UP']
          },
          tags: [],
          prescriptions: []
        }
      ]);

      vi.mocked(getPharmaciesByLocation).mockResolvedValue({
        pharmaciesByLocation: [
          generatePharmacy({
            id: 'phr_insured',
            name: 'Northside Pharmacy',
            price: 16.25,
            retailPrice: 40,
            source: 'goodrx'
          })
        ]
      });
      vi.mocked(setOrderPharmacy).mockResolvedValue(true);

      renderApp();
      await navigateToPharmacyScreen();

      expect(await screen.findByText('Ways to pay')).toBeInTheDocument();
      expect(await screen.findByText('With insurance')).toBeInTheDocument();
      expect(await screen.findByText('$12')).toBeInTheDocument();
      expect(await screen.findByText('Coupon price')).toBeInTheDocument();
      expect(await screen.findByText('$16.25')).toBeInTheDocument();

      await scrollCardsIntoView();
      await waitFor(() => {
        expect(offerImpressions().map((properties) => properties.offerType)).toEqual(
          expect.arrayContaining(['Arrive', 'GoodRx'])
        );
      });

      expect(offerImpressions().map((properties) => properties.pharmacyName)).toEqual([
        'Northside Pharmacy',
        'Northside Pharmacy'
      ]);

      getPharmacyMock.mockReturnValue({ type: 'PICK_UP', selectedPharmacy: undefined });
      await userEvent.click(await screen.findByRole('radio', { name: 'Northside Pharmacy' }));
      await userEvent.click(await screen.findByText(text.selectPharmacy));

      await waitFor(() => {
        const selectedTypes = vi
          .mocked(getPatientAnalytics().track)
          .mock.calls.filter(([event]) => event === 'Offer Selected')
          .map(([, , properties]) => properties?.offerType);
        expect(selectedTypes).toEqual(['Arrive', 'GoodRx']);
      });
    }, 15_000);

    test('shows every offer on one card and tracks a selection per offer', async () => {
      getOrderMock.mockResolvedValue(
        generateOrder({
          id: 'ord_testId777',
          state: 'ROUTING',
          patient: generatePatient(),
          fills: [generateFill('test-treatment')],
          address: {
            street1: '123 Main St',
            street2: undefined,
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            country: 'US'
          }
        })
      );
      const pharmacy = {
        id: 'phr_clinic',
        name: 'Clinic Pharmacy',
        fulfillmentTypes: ['PICK_UP' as const]
      };
      fetchPharmacyOffersMock.mockResolvedValue([
        {
          source: 'UK_HEALTH',
          isPromoted: false,
          pricing: { costAmount: 30, costAmountTitle: 'Cash Price' },
          pharmacy,
          tags: [],
          prescriptions: []
        },
        {
          source: 'ARRIVE',
          isPromoted: false,
          pricing: { costAmount: 12, costAmountTitle: 'With insurance' },
          pharmacy,
          tags: [],
          prescriptions: []
        }
      ]);
      getPharmacyMock.mockReturnValue({ type: 'PICK_UP', selectedPharmacy: undefined });
      vi.mocked(getPharmaciesByLocation).mockResolvedValue({
        pharmaciesByLocation: [generatePharmacy({ id: 'phr_clinic', name: 'Clinic Pharmacy' })]
      });
      vi.mocked(setOrderPharmacy).mockResolvedValue(true);

      renderApp();
      await navigateToPharmacyScreen();

      expect(await screen.findByText('Cash Price')).toBeInTheDocument();
      expect(await screen.findByText('With insurance')).toBeInTheDocument();

      await userEvent.click(await screen.findByRole('radio', { name: 'Clinic Pharmacy' }));
      await userEvent.click(await screen.findByText(text.selectPharmacy));

      await waitFor(() => {
        const selectedTypes = vi
          .mocked(getPatientAnalytics().track)
          .mock.calls.filter(([event]) => event === 'Offer Selected')
          .map(([, , properties]) => properties?.offerType);
        expect(selectedTypes).toEqual(['UK Health', 'Arrive']);
      });

      // every price the patient could have picked rides along on the submit event
      const [, , submitted] = vi
        .mocked(getPatientAnalytics().track)
        .mock.calls.find(([event]) => event === 'Pharmacy Selection Submitted')!;
      expect(submitted?.waysToPay).toEqual([
        { source: 'UK Health', price: 30 },
        { source: 'Arrive', price: 12 }
      ]);
    }, 15_000);

    test('tracks an impression for a priceless offer, which still shows its tags', async () => {
      getOrderMock.mockResolvedValue(
        generateOrder({
          id: 'ord_testId777',
          state: 'ROUTING',
          patient: generatePatient(),
          fills: [generateFill('test-treatment')],
          address: {
            street1: '123 Main St',
            street2: undefined,
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            country: 'US'
          }
        })
      );
      fetchPharmacyOffersMock.mockResolvedValue([
        {
          source: 'UK_HEALTH',
          isPromoted: false,
          pricing: {},
          pharmacy: { id: 'phr_uk', name: 'Boots Pharmacy', fulfillmentTypes: ['PICK_UP'] },
          tags: [{ kind: 'IN_NETWORK', label: 'In network' }],
          prescriptions: []
        }
      ]);
      getPharmacyMock.mockReturnValue({ type: 'PICK_UP', selectedPharmacy: undefined });
      vi.mocked(getPharmaciesByLocation).mockResolvedValue({
        pharmaciesByLocation: [generatePharmacy({ id: 'phr_uk', name: 'Boots Pharmacy' })]
      });

      renderApp();
      await navigateToPharmacyScreen();

      // no price to put in Ways to pay, but the offer is on the card either way
      expect(await screen.findByText('In network')).toBeInTheDocument();
      expect(screen.queryByTestId('payment-options')).not.toBeInTheDocument();

      await scrollCardsIntoView();
      await waitFor(() => {
        expect(
          offerImpressions().map((properties) => [properties.offerType, properties.offerShown])
        ).toEqual([['UK Health', false]]);
      });
    }, 15_000);

    // the UK Health strategy builds a static, priceless bundle for its configured pharmacy
    const promotedUkHealthOffer = (id: string, name: string): PharmacyOffer => ({
      source: 'UK_HEALTH',
      isPromoted: true,
      pricing: {},
      pharmacy: { id, name, fulfillmentTypes: ['PICK_UP'] },
      tags: [{ kind: 'ONSITE_PICKUP', label: 'Onsite pickup' }],
      prescriptions: []
    });

    // UK org orders get no priced pharmacies, so the page falls back to distance without prices
    const renderWithPricesDisabled = async (
      orderId: string,
      offers: PharmacyOffer[],
      orderOverrides: Partial<Order> = {}
    ) => {
      getOrderMock.mockResolvedValue(
        generateOrder({
          ...orderOverrides,
          id: orderId,
          state: 'ROUTING',
          patient: generatePatient(),
          fills: [generateFill('test-treatment')],
          address: {
            street1: '123 Main St',
            street2: undefined,
            city: 'Lexington',
            state: 'KY',
            postalCode: '40503',
            country: 'US'
          }
        })
      );
      fetchPharmacyOffersMock.mockResolvedValue(offers);
      getPharmacyMock.mockReturnValue({ type: 'PICK_UP', selectedPharmacy: undefined });
      vi.mocked(getPharmaciesByLocation)
        .mockResolvedValueOnce({ pharmaciesByLocation: [] })
        .mockResolvedValue({
          pharmaciesByLocation: [generatePharmacy({ id: 'phr_nearby', name: 'Nearby Pharmacy' })]
        });

      renderApp();
      await navigateToPharmacyScreen();
    };

    const trackedImpressionPharmacyIds = () =>
      offerImpressions().map((properties) => properties.pharmacy_id);

    test('tracks a single promoted offer above the tabs when prices are disabled', async () => {
      await renderWithPricesDisabled('ord_pricesDisabled', [
        promotedUkHealthOffer('phr_01K7YX6BQ894T8800BZAQSR57S', 'UK Fountain Court Clinic Pharmacy')
      ]);

      expect(await screen.findByText('UK Fountain Court Clinic Pharmacy')).toBeInTheDocument();

      await scrollCardsIntoView();
      await waitFor(() => {
        expect(getPatientAnalytics().track).toHaveBeenCalledWith(
          'Offer Impression',
          expect.anything(),
          expect.objectContaining({
            offerType: 'UK Health',
            pharmacy_id: 'phr_01K7YX6BQ894T8800BZAQSR57S',
            pharmacy_name: 'UK Fountain Court Clinic Pharmacy'
          })
        );
      });
    }, 15_000);

    test('tracks promoted offers in the pickup tab when prices are disabled', async () => {
      // more than one promoted UK Health offer sends them all into their tabs
      await renderWithPricesDisabled('ord_pricesDisabledTabs', [
        promotedUkHealthOffer(
          'phr_01K7YX6BQ894T8800BZAQSR57S',
          'UK Fountain Court Clinic Pharmacy'
        ),
        promotedUkHealthOffer('phr_01K7YX6BH8T8EMXQZ5NY69F22V', 'UK The Apothecary')
      ]);

      expect(await screen.findByText('UK Fountain Court Clinic Pharmacy')).toBeInTheDocument();
      expect(await screen.findByText('UK The Apothecary')).toBeInTheDocument();

      await scrollCardsIntoView();
      await waitFor(() => {
        expect(trackedImpressionPharmacyIds()).toEqual(
          expect.arrayContaining([
            'phr_01K7YX6BQ894T8800BZAQSR57S',
            'phr_01K7YX6BH8T8EMXQZ5NY69F22V'
          ])
        );
      });
    }, 15_000);

    test('tracks clicking and selecting a promoted offer when prices are disabled', async () => {
      vi.mocked(setOrderPharmacy).mockResolvedValue(true);
      await renderWithPricesDisabled('ord_pricesDisabledSelect', [
        promotedUkHealthOffer('phr_01K7YX6BQ894T8800BZAQSR57S', 'UK Fountain Court Clinic Pharmacy')
      ]);

      await userEvent.click(
        await screen.findByRole('radio', { name: 'UK Fountain Court Clinic Pharmacy' })
      );
      await userEvent.click(await screen.findByText(text.selectPharmacy));

      await waitFor(() => {
        expect(getPatientAnalytics().track).toHaveBeenCalledWith(
          'Offer Selected',
          expect.anything(),
          expect.objectContaining({
            offerType: 'UK Health',
            pharmacyId: 'phr_01K7YX6BQ894T8800BZAQSR57S'
          })
        );
      });
      expect(getPatientAnalytics().track).toHaveBeenCalledWith(
        'Offer Clicked',
        expect.anything(),
        expect.objectContaining({ pharmacyId: 'phr_01K7YX6BQ894T8800BZAQSR57S' })
      );
    }, 15_000);

    test('does not track selecting a plain pharmacy card when prices are disabled', async () => {
      vi.mocked(setOrderPharmacy).mockResolvedValue(true);
      await renderWithPricesDisabled('ord_pricesDisabledSelectPlain', []);

      await userEvent.click(await screen.findByRole('radio', { name: 'Nearby Pharmacy' }));
      await userEvent.click(await screen.findByText(text.selectPharmacy));

      await waitFor(() =>
        expect(getPatientAnalytics().track).toHaveBeenCalledWith(
          'Pharmacy Selection Submitted',
          expect.anything(),
          expect.anything()
        )
      );
      const offerSelectionEvents = vi
        .mocked(getPatientAnalytics().track)
        .mock.calls.map(([event]) => event)
        .filter((event) => event === 'Offer Selected' || event === 'Offer Clicked');
      expect(offerSelectionEvents).toEqual([]);
    }, 15_000);

    test('does not track plain pickup pharmacy cards when prices are disabled', async () => {
      await renderWithPricesDisabled('ord_pricesDisabledPlainPickup', []);

      expect(await screen.findByText('Nearby Pharmacy')).toBeInTheDocument();

      await scrollCardsIntoView();
      expect(trackedImpressionPharmacyIds()).toEqual([]);
    }, 15_000);

    test('does not track plain delivery pharmacy cards when prices are disabled', async () => {
      vi.mocked(getPharmacies).mockResolvedValue({
        pharmacies: [
          {
            id: 'test-mail-order-1',
            name: 'Testpill',
            logo: 'https://logos.boson.health/pharmacies/capsule-logo.png',
            fulfillmentTypes: ['MAIL_ORDER'] as FulfillmentType[]
          }
        ]
      });
      // delivery pharmacies only show when the org enables them and prices are disabled
      await renderWithPricesDisabled('ord_pricesDisabledPlainDelivery', [], {
        organization: {
          id: 'org_test_defaultId',
          name: 'Test Org',
          settings: { patientUx: { enablePatientDeliveryPharmacies: true } }
        } as Order['organization']
      });

      await userEvent.click(screen.getByRole('tab', { name: 'Delivery' }));
      expect(await screen.findByText('Testpill')).toBeInTheDocument();

      await scrollCardsIntoView();
      expect(trackedImpressionPharmacyIds()).toEqual([]);
    }, 15_000);

    test('shows offers when they are available and price is enabled - doing the same thing again', async () => {
      const { getPharmaciesByLocation, setOrderPharmacy, getOrder } = await import('../api');
      const getOrderMock = vi.mocked(getOrder);
      const singlePrescriptionOrder = generateOrder({
        id: 'ord_testId777',
        state: 'ROUTING',
        patient: generatePatient(),
        fills: [generateFill('test-treatment')],
        address: {
          street1: '123 Main St',
          street2: undefined,
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US'
        }
      });
      getOrderMock.mockResolvedValue(singlePrescriptionOrder);

      const getPharmaciesByLocationMock = vi.mocked(getPharmaciesByLocation);
      getPharmaciesByLocationMock.mockResolvedValue({
        pharmaciesByLocation: [
          generatePharmacy({
            id: 'phr_testId123',
            name: 'Test Local Pickup Pharmacy',
            price: 444,
            retailPrice: 1000
          })
        ]
      });

      const setOrderPharmacyMock = vi.mocked(setOrderPharmacy);
      setOrderPharmacyMock.mockResolvedValue(true);

      renderApp();
      await navigateToPharmacyScreen();

      // Price is already enabled by default, so offers should show
      // Wait for offers to load and check they are displayed
      expect(await screen.findByText('Amazon Pharmacy')).toBeInTheDocument();
      expect(await screen.findByText('Delivers in 1-2 days')).toBeInTheDocument();
      expect(await screen.findByText('$19.99')).toBeInTheDocument();
      expect(await screen.findByText('Prime Rx Price')).toBeInTheDocument();
    }, 10_000);

    test('does not show offers when no offers are available', async () => {
      // Override the mock to return empty array for this test
      const { fetchPharmacyOffers } = await import('./pharmacy.utils');
      vi.mocked(fetchPharmacyOffers).mockResolvedValueOnce([]);

      const { getPharmaciesByLocation, setOrderPharmacy, getOrder } = await import('../api');
      const getOrderMock = vi.mocked(getOrder);
      const singlePrescriptionOrder = generateOrder({
        id: 'ord_testId777',
        state: 'ROUTING',
        patient: generatePatient(),
        fills: [generateFill('test-treatment')],
        address: {
          street1: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US'
        }
      });
      getOrderMock.mockResolvedValue(singlePrescriptionOrder);

      const getPharmaciesByLocationMock = vi.mocked(getPharmaciesByLocation);
      getPharmaciesByLocationMock.mockResolvedValue({
        pharmaciesByLocation: [
          generatePharmacy({
            id: 'phr_testId123',
            name: 'Test Local Pickup Pharmacy',
            price: 444,
            retailPrice: 1000
          })
        ]
      });

      const setOrderPharmacyMock = vi.mocked(setOrderPharmacy);
      setOrderPharmacyMock.mockResolvedValue(true);

      renderApp();
      await navigateToPharmacyScreen();

      // Check that no offers are displayed
      expect(screen.queryByText('Amazon Pharmacy')).not.toBeInTheDocument();
      expect(screen.queryByText('Novocare')).not.toBeInTheDocument();
    }, 10_000);
  });

  describe('address requirements', () => {
    test('does not show offers when order has no address', async () => {
      const { getPharmaciesByLocation, setOrderPharmacy, getOrder, getOfferBundles } = await import(
        '../api'
      );
      const getOrderMock = vi.mocked(getOrder);
      const singlePrescriptionOrder = generateOrder({
        id: 'ord_testId777',
        state: 'ROUTING',
        patient: generatePatient(),
        fills: [generateFill('test-treatment')]
        // No address provided
      });
      getOrderMock.mockResolvedValue(singlePrescriptionOrder);
      const { fetchPharmacyOffers } = await import('./pharmacy.utils');
      vi.mocked(fetchPharmacyOffers).mockResolvedValueOnce([]);

      const getPharmaciesByLocationMock = vi.mocked(getPharmaciesByLocation);
      getPharmaciesByLocationMock.mockResolvedValue({
        pharmaciesByLocation: [
          generatePharmacy({
            id: 'phr_testId123',
            name: 'Test Local Pickup Pharmacy',
            price: 444,
            retailPrice: 1000
          })
        ]
      });

      const setOrderPharmacyMock = vi.mocked(setOrderPharmacy);
      setOrderPharmacyMock.mockResolvedValue(true);

      renderApp();
      await navigateToPharmacyScreen();

      // Wait for component to render
      await screen.findByRole('heading', { name: 'Choose a Pharmacy' });

      // Should not show any offers
      expect(screen.queryByText('Amazon Pharmacy')).not.toBeInTheDocument();
      expect(screen.queryByText('Insurance Price')).not.toBeInTheDocument();
      expect(screen.queryByText('Prime Rx Price')).not.toBeInTheDocument();

      // Should only show pickup section
      expect(screen.getByText('Pick up')).toBeInTheDocument();
    }, 10_000);

    test('shows location even when order has no address (current behavior)', async () => {
      const { getPharmaciesByLocation, setOrderPharmacy, getOrder } = await import('../api');
      const getOrderMock = vi.mocked(getOrder);
      const singlePrescriptionOrder = generateOrder({
        id: 'ord_testId777',
        state: 'ROUTING',
        patient: generatePatient(),
        fills: [generateFill('test-treatment')]
        // No address provided
      });
      getOrderMock.mockResolvedValue(singlePrescriptionOrder);

      const getPharmaciesByLocationMock = vi.mocked(getPharmaciesByLocation);
      getPharmaciesByLocationMock.mockResolvedValue({
        pharmaciesByLocation: []
      });

      const setOrderPharmacyMock = vi.mocked(setOrderPharmacy);
      setOrderPharmacyMock.mockResolvedValue(true);

      renderApp();
      await navigateToPharmacyScreen();

      // Current behavior: location is shown even without address
      // This suggests there's a default address or location being set elsewhere
      expect(await screen.findByText('Showing pharmacies near')).toBeInTheDocument();
      expect(await screen.findByText('123 Main St, New York, NY 10001')).toBeInTheDocument();
    }, 10_000);

    test('does not show offers even when order has address (current behavior)', async () => {
      // Override the mock to return empty array for this test
      const { fetchPharmacyOffers } = await import('./pharmacy.utils');
      vi.mocked(fetchPharmacyOffers).mockResolvedValueOnce([]);

      const { getPharmaciesByLocation, setOrderPharmacy, getOrder } = await import('../api');
      const getOrderMock = vi.mocked(getOrder);
      const singlePrescriptionOrder = generateOrder({
        id: 'ord_testId777',
        state: 'ROUTING',
        patient: generatePatient(),
        fills: [generateFill('test-treatment')],
        address: {
          street1: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US'
        }
      });
      getOrderMock.mockResolvedValue(singlePrescriptionOrder);

      const getPharmaciesByLocationMock = vi.mocked(getPharmaciesByLocation);
      getPharmaciesByLocationMock.mockResolvedValue({
        pharmaciesByLocation: [
          generatePharmacy({
            id: 'phr_testId123',
            name: 'Test Local Pickup Pharmacy',
            price: 444,
            retailPrice: 1000
          })
        ]
      });

      const setOrderPharmacyMock = vi.mocked(setOrderPharmacy);
      setOrderPharmacyMock.mockResolvedValue(true);

      renderApp();
      await navigateToPharmacyScreen();

      // Should show location information
      expect(await screen.findByText('Showing pharmacies near')).toBeInTheDocument();
      expect(await screen.findByText('123 Main St, New York, NY 10001')).toBeInTheDocument();

      // The Delivery tab always renders once a location is set, but with no offers/mail-order
      // pharmacies it surfaces no sponsored content.
      expect(screen.getByRole('tab', { name: 'Delivery' })).toBeInTheDocument();
      expect(screen.queryByText('Get delivered')).not.toBeInTheDocument();
      expect(screen.queryByText('Amazon Pharmacy')).not.toBeInTheDocument();
      expect(screen.queryByText('Insurance Price')).not.toBeInTheDocument();

      // Should show pickup tab
      expect(screen.getByRole('tab', { name: 'Pick up' })).toBeInTheDocument();
    }, 10_000);
  });

  test('puts preferred pharmacy at the top of the pickup list', async () => {
    const { getPharmaciesByLocation, setOrderPharmacy, getOrder } = await import('../api');
    const preferredId = 'phr_preferredId123';

    const singlePrescriptionOrder = generateOrder({
      id: 'ord_testId777',
      state: 'ROUTING',
      patient: generatePatient({
        preferredPharmacies: [{ id: preferredId, name: 'Preferred Pharmacy' }]
      }),
      fills: [generateFill('test-treatment')],
      address: {
        street1: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US'
      }
    });

    const getOrderMock = vi.mocked(getOrder);
    getOrderMock.mockResolvedValue(singlePrescriptionOrder);

    const getPharmaciesByLocationMock = vi.mocked(getPharmaciesByLocation);
    getPharmaciesByLocationMock.mockResolvedValue({
      pharmaciesByLocation: [
        generatePharmacy({
          id: 'phr_otherId999',
          name: 'Other Pharmacy'
        })
      ]
    });

    const setOrderPharmacyMock = vi.mocked(setOrderPharmacy);
    setOrderPharmacyMock.mockResolvedValue(true);

    renderApp();
    await navigateToPharmacyScreen();

    const pharmacyNames = await screen.findAllByTestId('pharmacy-info');
    const textContents = pharmacyNames.map((node) => node.textContent ?? '');
    const preferredIndex = textContents.findIndex((text) => text.includes('Preferred Pharmacy'));
    const otherIndex = textContents.findIndex((text) => text.includes('Other Pharmacy'));

    expect(preferredIndex).toBeGreaterThan(-1);
    expect(otherIndex).toBeGreaterThan(-1);
    expect(preferredIndex).toBeLessThan(otherIndex);
  }, 10_000);

  test('does not duplicate preferred pharmacy when it is already in the location list', async () => {
    const { getPharmaciesByLocation, setOrderPharmacy, getOrder } = await import('../api');
    const preferredId = 'phr_preferredId123';

    const singlePrescriptionOrder = generateOrder({
      id: 'ord_testId777',
      state: 'ROUTING',
      patient: generatePatient({
        preferredPharmacies: [{ id: preferredId, name: 'Preferred Pharmacy' }]
      }),
      fills: [generateFill('test-treatment')],
      address: {
        street1: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US'
      }
    });

    const getOrderMock = vi.mocked(getOrder);
    getOrderMock.mockResolvedValue(singlePrescriptionOrder);

    const getPharmaciesByLocationMock = vi.mocked(getPharmaciesByLocation);
    getPharmaciesByLocationMock.mockResolvedValue({
      pharmaciesByLocation: [
        generatePharmacy({
          id: preferredId,
          name: 'Preferred Pharmacy'
        }),
        generatePharmacy({
          id: 'phr_otherId999',
          name: 'Other Pharmacy'
        })
      ]
    });

    const setOrderPharmacyMock = vi.mocked(setOrderPharmacy);
    setOrderPharmacyMock.mockResolvedValue(true);

    renderApp();
    await navigateToPharmacyScreen();

    const pharmacyNames = await screen.findAllByTestId('pharmacy-info');
    const textContents = pharmacyNames.map((node) => node.textContent ?? '');
    const preferredIndex = textContents.findIndex((text) => text.includes('Preferred Pharmacy'));
    const otherIndex = textContents.findIndex((text) => text.includes('Other Pharmacy'));
    const preferredCount = textContents.filter((text) =>
      text.includes('Preferred Pharmacy')
    ).length;

    expect(preferredCount).toBe(1);
    expect(preferredIndex).toBeGreaterThan(-1);
    expect(otherIndex).toBeGreaterThan(-1);
    expect(preferredIndex).toBeLessThan(otherIndex);
  }, 10_000);

  test('does not show preferred pharmacy alone while pharmacy results are still loading', async () => {
    const { getPharmaciesByLocation, getOrder } = await import('../api');
    const preferredId = 'phr_preferredId123';

    const singlePrescriptionOrder = generateOrder({
      id: 'ord_testId777',
      state: 'ROUTING',
      patient: generatePatient({
        preferredPharmacies: [{ id: preferredId, name: 'Preferred Pharmacy' }]
      }),
      fills: [generateFill('test-treatment')],
      address: {
        street1: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US'
      }
    });

    vi.mocked(getOrder).mockResolvedValue(singlePrescriptionOrder);

    let resolvePharmacies: (value: { pharmaciesByLocation: Pharmacy[] }) => void;
    vi.mocked(getPharmaciesByLocation).mockReturnValue(
      new Promise((resolve) => {
        resolvePharmacies = resolve;
      })
    );

    renderApp();
    await navigateToPharmacyScreen();

    // Pharmacy results haven't resolved yet so don't render preferred pharmacy alone
    expect(screen.queryByTestId('pharmacy-info')).not.toBeInTheDocument();

    resolvePharmacies!({
      pharmaciesByLocation: [generatePharmacy({ id: 'phr_otherId999', name: 'Other Pharmacy' })]
    });

    expect(await screen.findByText('Preferred Pharmacy')).toBeInTheDocument();
    expect(await screen.findByText('Other Pharmacy')).toBeInTheDocument();
  }, 10_000);

  describe('multi-rx offers', () => {
    test('shows Total Price title for mixed CASH and PRIME_RX bundle', async () => {
      const { fetchPharmacyOffers } = await import('./pharmacy.utils');
      vi.mocked(fetchPharmacyOffers).mockResolvedValueOnce([
        {
          source: 'AMAZON_PHARMACY',
          isPromoted: true,
          pricing: {
            costAmount: 21.98,
            costAmountTitle: 'Total Price',
            retailAmount: 200.0,
            retailAmountTitle: 'Retail'
          },
          deliveryEstimate: 'Delivers in 2-3 days',
          pharmacy: {
            id: 'phr_01GA9HPV5XYTC1NNX213VRRBZ3',
            name: 'Amazon Pharmacy',
            fulfillmentTypes: ['MAIL_ORDER']
          },
          tags: [],
          prescriptions: [
            { name: 'Metformin', pricingType: 'CASH', amount: 9.99, retailAmount: 100.0 },
            { name: 'Lisinopril', pricingType: 'PRIME_RX', amount: 11.99, retailAmount: 100.0 }
          ]
        }
      ]);

      const { getPharmaciesByLocation, getOrder } = await import('../api');
      vi.mocked(getOrder).mockResolvedValue(
        generateOrder({
          id: 'ord_testId888',
          state: 'ROUTING',
          patient: generatePatient(),
          fills: [generateFill('test-treatment-1'), generateFill('test-treatment-2')],
          address: {
            street1: '123 Main St',
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            country: 'US'
          }
        })
      );
      vi.mocked(getPharmaciesByLocation).mockResolvedValue({
        pharmaciesByLocation: [
          generatePharmacy({ id: 'phr_testId123', name: 'Test Local Pickup Pharmacy' })
        ]
      });

      renderApp();
      await navigateToPharmacyScreen();

      expect(await screen.findByText('$21.98')).toBeInTheDocument();
      expect(await screen.findByText('Total Price')).toBeInTheDocument();
    }, 10_000);

    test('shows per-medication prices and promotions for multi-rx bundle offers', async () => {
      const { fetchPharmacyOffers } = await import('./pharmacy.utils');
      vi.mocked(fetchPharmacyOffers).mockResolvedValueOnce([
        {
          source: 'AMAZON_PHARMACY',
          isPromoted: true,
          pricing: {
            costAmount: 24.99,
            costAmountTitle: 'Cash Price',
            retailAmount: 200.0,
            retailAmountTitle: 'Retail'
          },
          deliveryEstimate: 'Delivers in 2-3 days',
          pharmacy: {
            id: 'phr_01GA9HPV5XYTC1NNX213VRRBZ3',
            name: 'Amazon Pharmacy',
            fulfillmentTypes: ['MAIL_ORDER']
          },
          tags: [],
          prescriptions: [
            {
              name: 'Metformin',
              amount: 9.99,
              retailAmount: 100.0,
              promotions: [{ type: 'PHARMACY_RX_COUPON', amountSaved: 5.5 }]
            },
            {
              name: 'Lisinopril',
              amount: 15.0,
              retailAmount: 100.0,
              promotions: [{ type: 'PHARMACY_RX_COUPON' }]
            }
          ]
        }
      ]);

      const { getPharmaciesByLocation, getOrder } = await import('../api');
      vi.mocked(getOrder).mockResolvedValue(
        generateOrder({
          id: 'ord_testId888',
          state: 'ROUTING',
          patient: generatePatient(),
          fills: [generateFill('test-treatment-1'), generateFill('test-treatment-2')],
          address: {
            street1: '123 Main St',
            city: 'New York',
            state: 'NY',
            postalCode: '10001',
            country: 'US'
          }
        })
      );
      vi.mocked(getPharmaciesByLocation).mockResolvedValue({
        pharmaciesByLocation: [
          generatePharmacy({ id: 'phr_testId123', name: 'Test Local Pickup Pharmacy' })
        ]
      });

      renderApp();
      await navigateToPharmacyScreen();

      // per-med prices
      expect(await screen.findByText('Metformin')).toBeInTheDocument();
      expect(await screen.findByText('$9.99')).toBeInTheDocument();
      expect(await screen.findByText('Lisinopril')).toBeInTheDocument();
      expect(await screen.findByText('$15')).toBeInTheDocument();

      // promotion with amountSaved shows the discount amount
      expect(await screen.findByText('Up to $5.50')).toBeInTheDocument();

      // promotion without amountSaved shows generic coupon text
      expect(screen.getByText('with coupon if eligible')).toBeInTheDocument();
    }, 10_000);
  });

  test('shows mail order pharmacies inline on the Delivery tab and submits to a mail order pharmacy', async () => {
    const testOrder = generateOrder({
      id: 'ord_testId666',
      state: 'ROUTING',
      patient: generatePatient(),
      fills: [generateFill('test-treatment')]
    });
    const mailOrderPharmacyData = [
      {
        id: 'test-mail-order-1',
        name: 'Testpill',
        logo: 'https://logos.boson.health/pharmacies/capsule-logo.png',
        fulfillmentTypes: ['MAIL_ORDER'] as FulfillmentType[]
      },
      {
        id: 'test-mail-order-2',
        name: 'TestRx',
        logo: 'https://logos.boson.health/pharmacies/optum-logo.png',
        fulfillmentTypes: ['MAIL_ORDER'] as FulfillmentType[]
      }
    ];

    const { getPharmacies, getOrder, setOrderPharmacy } = await import('../api');
    vi.mocked(getOrder).mockResolvedValue(testOrder);
    vi.mocked(getPharmacies).mockResolvedValue({ pharmacies: mailOrderPharmacyData });
    vi.mocked(setOrderPharmacy).mockResolvedValue(true);

    renderApp();
    await navigateToPharmacyScreen();

    await userEvent.click(screen.getByRole('tab', { name: 'Delivery' }));
    const mailOrderOption = await screen.findByText('TestRx');
    expect(mailOrderOption).toBeInTheDocument();

    await userEvent.click(mailOrderOption);
    await userEvent.click(await screen.findByText(text.selectPharmacy));

    await waitFor(() => expect(setOrderPharmacy).toHaveBeenCalled());
    expect(vi.mocked(setOrderPharmacy).mock.calls[0].slice(0, 2)).toEqual([
      'ord_testId666',
      'test-mail-order-2'
    ]);
  }, 15_000);

  describe('Autorouted pharmacy confirmation', () => {
    const testAutoroutedPharmacy = generatePharmacy({
      id: generateId('phr_'),
      name: 'Auto-Routed Pharmacy'
    });
    const testAlternatePharmacy = generatePharmacy({
      id: generateId('phr_'),
      name: 'Alternate Pharmacy'
    });

    const createAutoroutedOrder = () =>
      generateOrder({
        id: 'ord_testId777',
        state: 'PLACED',
        patient: generatePatient({ name: { full: 'Jane Doe' } }),
        fills: [generateFill('test-treatment')],
        fulfillments: [generateFulfillment({ state: 'PROCESSING' })],
        pharmacy: testAutoroutedPharmacy,
        isReroutable: true,
        address: {
          street1: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US'
        },
        metadata: {
          routingHistory: [{ selector: 'AUTO' }]
        }
      });

    beforeEach(async () => {
      localStorage.clear();

      const { getOrder, getPharmaciesByLocation, setOrderPharmacy, rerouteOrder } = await import(
        '../api'
      );

      vi.mocked(getOrder).mockResolvedValue(createAutoroutedOrder());
      vi.mocked(getPharmaciesByLocation).mockResolvedValue({
        pharmaciesByLocation: [testAutoroutedPharmacy, testAlternatePharmacy]
      });
      vi.mocked(setOrderPharmacy).mockResolvedValue(true);
      vi.mocked(rerouteOrder).mockResolvedValue(true);

      const { fetchPharmacyOffers, getPharmacy } = await import('./pharmacy.utils');
      vi.mocked(fetchPharmacyOffers).mockResolvedValue([]);
      vi.mocked(getPharmacy).mockReturnValue({
        type: 'PICK_UP',
        selectedPharmacy: testAutoroutedPharmacy
      });
    });

    afterEach(() => {
      localStorage.clear();
    });

    test('Auto-routed pharmacy shows sent here badge instead of current pharmacy tag', async () => {
      renderApp();
      await navigateToPharmacyScreen();

      expect(await screen.findByTestId('pharmacy-sent-here-badge')).toBeInTheDocument();

      const pharmacyInfos = await screen.findAllByTestId('pharmacy-info');
      for (const pharmacyInfo of pharmacyInfos) {
        const pharmacyName = pharmacyInfo.querySelector(`[data-testid="pharmacy-info-name"]`);
        const currentPharmacyTag = pharmacyInfo.querySelector(
          `[data-testid="pharmacy-info-current-pharmacy"]`
        );
        if (pharmacyName?.textContent?.includes(testAutoroutedPharmacy.name)) {
          expect(currentPharmacyTag).toBeNull();
        }
      }
    });

    test('Submitting auto-routed pharmacy stores confirmation in localStorage', async () => {
      renderApp();
      await navigateToPharmacyScreen();

      await userEvent.click(await screen.findByText(testAutoroutedPharmacy.name));
      await userEvent.click(await screen.findByText(text.selectPharmacy));

      await waitFor(() => screen.findByText(/preparing order/i), { timeout: 3000 });

      expect(hasConfirmedAutoroutedPharmacy('ord_testId777')).toBe(true);
    }, 15_000);

    test('Submitting auto-routed pharmacy navigates to status page without routing or rerouting order', async () => {
      renderApp();
      await navigateToPharmacyScreen();

      await userEvent.click(await screen.findByText(testAutoroutedPharmacy.name));
      await userEvent.click(await screen.findByText(text.selectPharmacy));

      await waitFor(() => screen.findByText(/preparing order/i), { timeout: 3000 });

      expect(vi.mocked(rerouteOrder)).not.toHaveBeenCalled();
      expect(vi.mocked(setOrderPharmacy)).not.toHaveBeenCalled();
    }, 15_000);

    test('Submitting alternate pharmacy clears localStorage confirmation and calls rerouteOrder', async () => {
      renderApp();
      await navigateToPharmacyScreen();

      markAutoroutedPharmacyConfirmed('ord_testId777');
      expect(hasConfirmedAutoroutedPharmacy('ord_testId777')).toBe(true);

      await userEvent.click(await screen.findByText(testAlternatePharmacy.name));
      await userEvent.click(await screen.findByText(text.selectPharmacy));

      await waitFor(() => screen.findByText(text.thankYou), { timeout: 3000 });
      await waitFor(() => screen.findByText(/preparing order/i), { timeout: 3000 });

      expect(hasConfirmedAutoroutedPharmacy('ord_testId777')).toBe(false);
      expect(vi.mocked(rerouteOrder)).toHaveBeenCalledWith(
        'ord_testId777',
        testAlternatePharmacy.id,
        expect.anything(),
        expect.anything()
      );
      expect(vi.mocked(setOrderPharmacy)).not.toHaveBeenCalled();
    }, 15_000);
  });

  describe('Sent-here fulfillment tabs', () => {
    test('defaults to the Delivery tab with a Sent here badge for a mail-order sent order', async () => {
      const mailOrderPharmacy = generatePharmacy({
        id: 'phr_mailSent',
        name: 'MailCo Pharmacy',
        fulfillmentTypes: ['MAIL_ORDER'] as FulfillmentType[]
      });
      const order = generateOrder({
        id: 'ord_testId777',
        state: 'PLACED',
        patient: generatePatient(),
        fills: [generateFill('test-treatment')],
        pharmacy: mailOrderPharmacy,
        isReroutable: true,
        metadata: { routingHistory: [{ selector: 'PROVIDER' }] }
      });

      const { getOrder, getPharmacies } = await import('../api');
      vi.mocked(getOrder).mockResolvedValue(order);
      vi.mocked(getPharmacies).mockResolvedValue({
        pharmacies: [
          {
            id: 'phr_mailSent',
            name: 'MailCo Pharmacy',
            fulfillmentTypes: ['MAIL_ORDER'] as FulfillmentType[]
          }
        ]
      });

      renderApp();
      await navigateToPharmacyScreen();

      expect(screen.getByRole('tab', { name: 'Delivery' })).toHaveAttribute(
        'aria-selected',
        'true'
      );
      expect(await screen.findByText('MailCo Pharmacy')).toBeInTheDocument();
      expect(await screen.findByTestId('pharmacy-sent-here-badge')).toBeInTheDocument();
    }, 10_000);

    test('shows the Sent here badge on the Pick up tab for a provider-routed pickup pharmacy', async () => {
      const pickupPharmacy = generatePharmacy({
        id: 'phr_pickupSent',
        name: 'Provider Pickup Pharmacy'
      });
      const order = generateOrder({
        id: 'ord_testId777',
        state: 'PLACED',
        patient: generatePatient(),
        fills: [generateFill('test-treatment')],
        pharmacy: pickupPharmacy,
        isReroutable: true,
        metadata: { routingHistory: [{ selector: 'PROVIDER' }] }
      });

      const { getOrder, getPharmaciesByLocation } = await import('../api');
      vi.mocked(getOrder).mockResolvedValue(order);
      vi.mocked(getPharmaciesByLocation).mockResolvedValue({
        pharmaciesByLocation: [pickupPharmacy]
      });

      renderApp();
      await navigateToPharmacyScreen();

      expect(screen.getByRole('tab', { name: text.pickUp })).toHaveAttribute(
        'aria-selected',
        'true'
      );
      expect(await screen.findByTestId('pharmacy-sent-here-badge')).toBeInTheDocument();
    }, 10_000);
  });
});

const renderApp = () => {
  const memoryRouter = createMemoryRouter(createRoutesFromElements(routeElements), {
    initialEntries: [`/?orderId=ord_testId777&token=${mockToken}`]
  });

  return { render: render(<RouterProvider router={memoryRouter} />), memoryRouter };
};

async function navigateToPharmacyScreen() {
  expect(await screen.findByRole('heading', { name: 'Choose a Pharmacy' })).toBeInTheDocument();
}
