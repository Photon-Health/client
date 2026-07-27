// Set environment variable BEFORE any imports
import.meta.env.VITE_AMAZON_PHARMACY_ID = 'phr_01GA9HPV5XYTC1NNX213VRRBZ3';

import { render, screen, waitFor } from '@testing-library/react';
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
import { getOrder, getPharmaciesByLocation, rerouteOrder, setOrderPharmacy } from '../api';
import { fetchOfferBundles, getPharmacy } from './pharmacy.utils';
import { FulfillmentType } from '../__generated__/graphql';
import { OfferBundleDetails } from '../utils/models';
import {
  hasConfirmedAutoroutedPharmacy,
  markAutoroutedPharmacyConfirmed
} from '../utils/autoroutedPharmacyConfirmationStorage';
import { text } from '../utils/text';

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
  getPatientCopy: vi.fn().mockResolvedValue({ faqs: [], copy: {} }),
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
  fetchOfferBundles: vi.fn(),
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

    const { fetchOfferBundles, getPharmacy } = await import('./pharmacy.utils');
    vi.mocked(fetchOfferBundles).mockResolvedValue([]);
    vi.mocked(getPharmacy).mockReturnValue({
      type: 'MAIL_ORDER',
      selectedPharmacy: { id: 'amazon_pharmacy_id', name: 'Amazon Pharmacy' }
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('offers', async () => {
    let fetchOfferBundlesMock: MockedFunction<typeof fetchOfferBundles>;
    let getPharmacyMock: MockedFunction<typeof getPharmacy>;
    let getOrderMock: MockedFunction<typeof getOrder>;

    const mockOfferBundles: OfferBundleDetails[] = [
      {
        costType: 'INSURANCE_ESTIMATE',
        deliveryEstimate: 'Delivers in 2-3 days',
        costAmount: 25.99,
        costAmountTitle: 'Insurance Price',
        retailAmount: 150.0,
        retailAmountTitle: 'Retail',
        pharmacy: {
          id: 'phr_01GA9HPV5XYTC1NNX213VRRBZ3',
          name: 'Amazon Pharmacy',
          fulfillmentTypes: ['MAIL_ORDER']
        },
        tags: ['In Stock', 'Free Shipping'],
        medications: [{ name: 'Metformin 500mg', amount: 25.99, retailAmount: 150.0 }]
      },
      {
        costType: 'PRIME_RX',
        deliveryEstimate: 'Delivers in 1-2 days',
        costAmount: 19.99,
        costAmountTitle: 'Prime Rx Price',
        retailAmount: 120.0,
        retailAmountTitle: 'Retail',
        pharmacy: {
          id: 'phr_01GA9HPV5XYTC1NNX213VRRBZ3',
          name: 'Amazon Pharmacy',
          fulfillmentTypes: ['MAIL_ORDER']
        },
        tags: ['Prime Member', 'Fast Delivery'],
        medications: [{ name: 'Metformin 500mg', amount: 19.99, retailAmount: 120.0 }]
      }
    ];

    beforeEach(async () => {
      fetchOfferBundlesMock = vi.mocked(fetchOfferBundles);
      fetchOfferBundlesMock.mockResolvedValue(mockOfferBundles);

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
      const { fetchOfferBundles } = await import('./pharmacy.utils');
      vi.mocked(fetchOfferBundles).mockResolvedValueOnce([]);

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
      const { fetchOfferBundles } = await import('./pharmacy.utils');
      vi.mocked(fetchOfferBundles).mockResolvedValueOnce([]);

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
      const { fetchOfferBundles } = await import('./pharmacy.utils');
      vi.mocked(fetchOfferBundles).mockResolvedValueOnce([]);

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

  describe('multi-rx offers', () => {
    test('shows Total Price title for mixed CASH and PRIME_RX bundle', async () => {
      const { fetchOfferBundles } = await import('./pharmacy.utils');
      vi.mocked(fetchOfferBundles).mockResolvedValueOnce([
        {
          costType: 'MIXED',
          costAmount: 21.98,
          costAmountTitle: 'Total Price',
          retailAmount: 200.0,
          retailAmountTitle: 'Retail',
          deliveryEstimate: 'Delivers in 2-3 days',
          pharmacy: {
            id: 'phr_01GA9HPV5XYTC1NNX213VRRBZ3',
            name: 'Amazon Pharmacy',
            fulfillmentTypes: ['MAIL_ORDER']
          },
          tags: [],
          medications: [
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
      const { fetchOfferBundles } = await import('./pharmacy.utils');
      vi.mocked(fetchOfferBundles).mockResolvedValueOnce([
        {
          costType: 'CASH',
          costAmount: 24.99,
          costAmountTitle: 'Cash Price',
          retailAmount: 200.0,
          retailAmountTitle: 'Retail',
          deliveryEstimate: 'Delivers in 2-3 days',
          pharmacy: {
            id: 'phr_01GA9HPV5XYTC1NNX213VRRBZ3',
            name: 'Amazon Pharmacy',
            fulfillmentTypes: ['MAIL_ORDER']
          },
          tags: [],
          medications: [
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

      const { fetchOfferBundles, getPharmacy } = await import('./pharmacy.utils');
      vi.mocked(fetchOfferBundles).mockResolvedValue([]);
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
