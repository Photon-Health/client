// Pins which cards on the pharmacy page fire offer analytics today ("Offer Impression",
// "Offer Clicked", "Offer Selected"), so changes to that behavior show up as diffs here.
// Tests marked PINNED capture behavior that's in question; see TECH-1040 Q<n>.
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { createMemoryRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import { routeElements } from '../Routes';
import { getOrder, getPharmacies, getPharmaciesByLocation, setOrderPharmacy } from '../api';
import { fetchPharmacyOffers } from './pharmacy.utils';
import { getPatientAnalytics } from '../configs/analytics';
import { FulfillmentType, Pharmacy as GQLPharmacy } from '../__generated__/graphql';
import { Order, PharmacyOffer } from '../utils/models';
import { text } from '../utils/text';
import {
  generateFill,
  generateFulfillment,
  generateOrder,
  generatePharmacy
} from '../test-utils/generators';
import { mockIntersectionObserver, scrollCardsIntoView } from '../test-utils/intersectionObserver';

mockIntersectionObserver();

vi.mock('@client/settings', () => ({
  // branded delivery options; phr_demoAmazon is the one id BrandedPharmacyCard can name without env
  getOrgMailOrderPharms: vi.fn().mockReturnValue({ patient: ['phr_demoAmazon'] })
}));

vi.mock('../api', () => ({
  geocode: vi.fn().mockResolvedValue({
    lat: 40.7128,
    lng: -74.006,
    address: '123 Main St, New York, NY 10001'
  }),
  getOrder: vi.fn(),
  getPharmaciesByLocation: vi.fn(),
  getPharmacies: vi.fn(),
  getOfferBundles: vi.fn().mockResolvedValue([]),
  rerouteOrder: vi.fn(),
  setOrderPharmacy: vi.fn(),
  setPreferredPharmacy: vi.fn(),
  triggerDemoNotification: vi.fn(),
  AUTH_HEADER_ERRORS: []
}));

vi.mock('../configs/graphqlClient', () => ({
  setAuthHeader: vi.fn(),
  graphQLClient: { request: vi.fn().mockResolvedValue({}) },
  gqlSerializer: { parse: vi.fn(), stringify: vi.fn() }
}));

// only the network-backed offer fetch is faked; getPharmacy runs for real
vi.mock('./pharmacy.utils', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./pharmacy.utils')>()),
  fetchPharmacyOffers: vi.fn()
}));

vi.mock('../hooks/usePageAnalytics');
vi.mock('react-ga4');
vi.mock('mixpanel-browser');

vi.mock('../components', async () => {
  const mod = await vi.importActual('../components');
  return {
    ...mod,
    FixedFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    LocationModal: () => null,
    InsuranceModal: () => null,
    PoweredBy: () => null,
    Nav: () => null,
    PrescriptionsList: () => null
  };
});

const mockToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30';

const OFFER_EVENTS = ['Offer Impression', 'Offer Clicked', 'Offer Selected'];

// [event, pharmacy id, offerType] for every offer event sent so far, in order
const offerEvents = () =>
  vi
    .mocked(getPatientAnalytics().track)
    .mock.calls.filter(([event]) => OFFER_EVENTS.includes(event))
    .map(([event, , properties]) => [
      event,
      properties?.pharmacy_id ?? properties?.pharmacyId,
      properties?.offerType
    ]);

interface Scenario {
  // the page only turns prices off when the priced search finds nothing nearby, as for UK orgs
  prices: 'on' | 'off';
  offers?: PharmacyOffer[];
  nearby?: GQLPharmacy[];
  mailOrder?: GQLPharmacy[];
  order?: Partial<Order>;
  // a placed order the patient moves from the Status page's "Change pharmacy"
  reroute?: boolean;
}

const currentPharmacy = generatePharmacy({
  id: 'phr_current',
  name: 'Current Pharmacy',
  fulfillmentTypes: ['PICK_UP'] as FulfillmentType[],
  isOpen: true
});

// a placed order the patient is allowed to move; its unresolved order error lets
// "Change pharmacy" go straight to the pharmacy page without asking for a reason
const reroutableOrder = (): Partial<Order> => ({
  state: 'PLACED',
  pharmacy: currentPharmacy,
  isReroutable: true,
  fulfillments: [generateFulfillment({ state: 'PROCESSING' })],
  exceptions: [{ exceptionType: 'ORDER_ERROR' }],
  organization: {
    id: 'org_test_defaultId',
    name: 'Test Org',
    settings: { patientUx: { enablePatientRerouting: true } }
  } as Order['organization']
});

// every test needs its own order id: impressions dedupe per order/pharmacy/offerType per page load
const renderPharmacyPage = async (
  orderId: string,
  { prices, offers = [], nearby = [], mailOrder = [], order = {}, reroute }: Scenario
) => {
  if (prices === 'on' && nearby.length === 0) {
    throw new Error('prices stay on only when the priced search returns a nearby pharmacy');
  }

  vi.mocked(getOrder).mockResolvedValue(
    generateOrder({
      fills: [generateFill('test-treatment')],
      state: 'ROUTING',
      ...(reroute ? reroutableOrder() : {}),
      ...order,
      id: orderId
    })
  );
  vi.mocked(fetchPharmacyOffers).mockResolvedValue(offers);
  vi.mocked(getPharmacies).mockResolvedValue({ pharmacies: mailOrder });
  if (prices === 'off') {
    vi.mocked(getPharmaciesByLocation).mockResolvedValueOnce({ pharmaciesByLocation: [] });
  }
  vi.mocked(getPharmaciesByLocation).mockResolvedValue({ pharmaciesByLocation: nearby });

  const router = createMemoryRouter(createRoutesFromElements(routeElements), {
    initialEntries: [`/?orderId=${orderId}&token=${mockToken}`]
  });
  render(<RouterProvider router={router} />);
  if (reroute) {
    // a placed order opens on Status, which adds openNow when the current pharmacy is closed
    await userEvent.click(await screen.findByText(/change pharmacy/i));
  }
  expect(await screen.findByRole('heading', { name: 'Choose a Pharmacy' })).toBeInTheDocument();
};

const plainPharmacy = generatePharmacy({ id: 'phr_plain', name: 'Plain Pharmacy' });
const couponPharmacy = generatePharmacy({
  id: 'phr_coupon',
  name: 'Coupon Pharmacy',
  price: 16.25,
  retailPrice: 40,
  source: 'goodrx'
});
const mailOrderPharmacy = generatePharmacy({
  id: 'phr_mail',
  name: 'Mail Pharmacy',
  fulfillmentTypes: ['MAIL_ORDER'] as FulfillmentType[]
});

const offer = ({
  id,
  name,
  source,
  isPromoted = false,
  costAmount,
  fulfillmentType = 'PICK_UP'
}: {
  id: string;
  name: string;
  source: string;
  isPromoted?: boolean;
  costAmount?: number;
  fulfillmentType?: FulfillmentType;
}): PharmacyOffer => ({
  source,
  isPromoted,
  pricing: costAmount == null ? {} : { costAmount, costAmountTitle: 'With insurance' },
  pharmacy: { id, name, fulfillmentTypes: [fulfillmentType] },
  tags: [{ kind: 'IN_NETWORK', label: 'In network' }],
  prescriptions: []
});

// the UK Health strategy builds a static, priceless bundle for its configured pharmacy
const fountainCourt = offer({
  id: 'phr_01K7YX6BQ894T8800BZAQSR57S',
  name: 'UK Fountain Court Clinic Pharmacy',
  source: 'UK_HEALTH',
  isPromoted: true
});
const apothecary = offer({
  id: 'phr_01K7YX6BH8T8EMXQZ5NY69F22V',
  name: 'UK The Apothecary',
  source: 'UK_HEALTH',
  isPromoted: true
});
const amazonDeliveryOffer = offer({
  id: 'phr_amazon',
  name: 'Amazon Pharmacy',
  source: 'AMAZON_PHARMACY',
  costAmount: 19.99,
  fulfillmentType: 'MAIL_ORDER'
});

const openTab = (name: string) => userEvent.click(screen.getByRole('tab', { name }));

const selectPharmacy = async (name: string) => {
  vi.mocked(setOrderPharmacy).mockResolvedValue(true);
  await userEvent.click(await screen.findByRole('radio', { name }));
  await userEvent.click(await screen.findByText(text.selectPharmacy));
  await waitFor(() => expect(setOrderPharmacy).toHaveBeenCalled());
};

describe('Pharmacy page offer analytics', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('plain pickup card (no offer, no visible price)', () => {
    test('PINNED (Q1): fires a None impression when prices are on', async () => {
      await renderPharmacyPage('ord_q1', { prices: 'on', nearby: [plainPharmacy] });
      expect(await screen.findByText('Plain Pharmacy')).toBeInTheDocument();

      await scrollCardsIntoView();

      expect(offerEvents()).toEqual([['Offer Impression', 'phr_plain', 'None']]);
    });

    test('fires nothing when prices are off (Q2)', async () => {
      await renderPharmacyPage('ord_q2', { prices: 'off', nearby: [plainPharmacy] });
      expect(await screen.findByText('Plain Pharmacy')).toBeInTheDocument();

      await scrollCardsIntoView();

      expect(offerEvents()).toEqual([]);
    });
  });

  describe('mail-order cards on the Delivery tab', () => {
    test('PINNED (Q3): fire a None impression when prices are on', async () => {
      await renderPharmacyPage('ord_q3_on', {
        prices: 'on',
        nearby: [plainPharmacy],
        mailOrder: [mailOrderPharmacy]
      });
      await openTab(text.delivery);
      expect(await screen.findByText('Mail Pharmacy')).toBeInTheDocument();

      await scrollCardsIntoView();

      expect(offerEvents()).toEqual([['Offer Impression', 'phr_mail', 'None']]);
    });

    test('fire nothing when prices are off (Q3)', async () => {
      await renderPharmacyPage('ord_q3_off', {
        prices: 'off',
        nearby: [plainPharmacy],
        mailOrder: [mailOrderPharmacy]
      });
      await openTab(text.delivery);
      expect(await screen.findByText('Mail Pharmacy')).toBeInTheDocument();

      await scrollCardsIntoView();

      expect(offerEvents()).toEqual([]);
    });
  });

  test('PINNED (Q4): branded delivery cards, shown only when prices are off, fire nothing', async () => {
    await renderPharmacyPage('ord_q4', {
      prices: 'off',
      nearby: [plainPharmacy],
      order: {
        organization: {
          id: 'org_test_defaultId',
          name: 'Test Org',
          settings: { patientUx: { enablePatientDeliveryPharmacies: true } }
        } as Order['organization']
      }
    });
    await openTab(text.delivery);
    expect(await screen.findByText('Amazon Pharmacy')).toBeInTheDocument();

    await scrollCardsIntoView();

    expect(offerEvents()).toEqual([]);
  });

  test('PINNED (Q5): a multi-Rx order hides the coupon price but still fires it, with price', async () => {
    await renderPharmacyPage('ord_q5', {
      prices: 'on',
      nearby: [couponPharmacy],
      order: { fills: [generateFill('first-treatment'), generateFill('second-treatment')] }
    });
    expect(await screen.findByText('Coupon Pharmacy')).toBeInTheDocument();
    expect(screen.queryByText('Coupon price')).not.toBeInTheDocument();

    await scrollCardsIntoView();

    expect(offerEvents()).toEqual([['Offer Impression', 'phr_coupon', 'GoodRx']]);
    expect(getPatientAnalytics().track).toHaveBeenCalledWith(
      'Offer Impression',
      expect.anything(),
      expect.objectContaining({ price: 16.25 })
    );
  });

  describe('coupon prices', () => {
    test('a visible coupon price fires an impression typed by its source (Q6)', async () => {
      await renderPharmacyPage('ord_q6', { prices: 'on', nearby: [couponPharmacy] });
      expect(await screen.findByText('Coupon price')).toBeInTheDocument();

      await scrollCardsIntoView();

      expect(offerEvents()).toEqual([['Offer Impression', 'phr_coupon', 'GoodRx']]);
    });

    test('PINNED (Q6): a coupon price with no known source fires as None', async () => {
      await renderPharmacyPage('ord_q6_unknown', {
        prices: 'on',
        nearby: [{ ...couponPharmacy, source: undefined }]
      });
      expect(await screen.findByText('Coupon price')).toBeInTheDocument();

      await scrollCardsIntoView();

      expect(offerEvents()).toEqual([['Offer Impression', 'phr_coupon', 'None']]);
    });

    test('an offer and a coupon price on one card each fire an impression (Q7)', async () => {
      await renderPharmacyPage('ord_q7', {
        prices: 'on',
        nearby: [couponPharmacy],
        offers: [
          offer({ id: 'phr_coupon', name: 'Coupon Pharmacy', source: 'ARRIVE', costAmount: 12 })
        ]
      });
      expect(await screen.findByText('Coupon price')).toBeInTheDocument();

      await scrollCardsIntoView();

      expect(offerEvents()).toEqual([
        ['Offer Impression', 'phr_coupon', 'Arrive'],
        ['Offer Impression', 'phr_coupon', 'GoodRx']
      ]);
    });
  });

  describe('offers', () => {
    test('a promoted offer above the tabs fires when prices are on (Q8)', async () => {
      await renderPharmacyPage('ord_q8_on', {
        prices: 'on',
        nearby: [couponPharmacy],
        offers: [fountainCourt]
      });
      expect(await screen.findByText('UK Fountain Court Clinic Pharmacy')).toBeInTheDocument();

      await scrollCardsIntoView();

      expect(offerEvents()).toEqual([
        ['Offer Impression', 'phr_01K7YX6BQ894T8800BZAQSR57S', 'UK Health'],
        ['Offer Impression', 'phr_coupon', 'GoodRx']
      ]);
    });

    test('PINNED (Q8): a promoted offer above the tabs fires nothing when prices are off', async () => {
      await renderPharmacyPage('ord_q8_off', {
        prices: 'off',
        nearby: [plainPharmacy],
        offers: [fountainCourt]
      });
      expect(await screen.findByText('UK Fountain Court Clinic Pharmacy')).toBeInTheDocument();

      await scrollCardsIntoView();

      expect(offerEvents()).toEqual([]);
    });

    test('several promoted UK Health offers move into the tabs and fire when prices are on (Q9)', async () => {
      await renderPharmacyPage('ord_q9_on', {
        prices: 'on',
        nearby: [couponPharmacy],
        offers: [fountainCourt, apothecary]
      });
      expect(await screen.findByText('UK The Apothecary')).toBeInTheDocument();

      await scrollCardsIntoView();

      expect(offerEvents()).toEqual([
        ['Offer Impression', 'phr_01K7YX6BQ894T8800BZAQSR57S', 'UK Health'],
        ['Offer Impression', 'phr_01K7YX6BH8T8EMXQZ5NY69F22V', 'UK Health'],
        ['Offer Impression', 'phr_coupon', 'GoodRx']
      ]);
    });

    test('PINNED (Q9): promoted UK Health offers in the tabs fire nothing when prices are off', async () => {
      await renderPharmacyPage('ord_q9_off', {
        prices: 'off',
        nearby: [plainPharmacy],
        offers: [fountainCourt, apothecary]
      });
      expect(await screen.findByText('UK The Apothecary')).toBeInTheDocument();

      await scrollCardsIntoView();

      expect(offerEvents()).toEqual([]);
    });

    test('PINNED (Q10): a pickup offer fires nothing when prices are off', async () => {
      await renderPharmacyPage('ord_q10_pickup_off', {
        prices: 'off',
        nearby: [plainPharmacy],
        offers: [
          offer({ id: 'phr_arrive', name: 'Arrive Pharmacy', source: 'ARRIVE', costAmount: 12 })
        ]
      });
      expect(await screen.findByText('Arrive Pharmacy')).toBeInTheDocument();

      await scrollCardsIntoView();

      expect(offerEvents()).toEqual([]);
    });

    test('a delivery offer fires when prices are on (Q10)', async () => {
      await renderPharmacyPage('ord_q10_delivery_on', {
        prices: 'on',
        nearby: [couponPharmacy],
        offers: [amazonDeliveryOffer]
      });
      await openTab(text.delivery);
      expect(await screen.findByText('Amazon Pharmacy')).toBeInTheDocument();

      await scrollCardsIntoView();

      expect(offerEvents()).toEqual([['Offer Impression', 'phr_amazon', 'Amazon Pharmacy']]);
    });

    test('PINNED (Q10): a delivery offer fires nothing when prices are off', async () => {
      await renderPharmacyPage('ord_q10_delivery_off', {
        prices: 'off',
        nearby: [plainPharmacy],
        offers: [amazonDeliveryOffer]
      });
      await openTab(text.delivery);
      expect(await screen.findByText('Amazon Pharmacy')).toBeInTheDocument();

      await scrollCardsIntoView();

      expect(offerEvents()).toEqual([]);
    });

    test('a priceless offer still fires, with offerShown false (Q11)', async () => {
      await renderPharmacyPage('ord_q11', {
        prices: 'on',
        nearby: [couponPharmacy],
        offers: [fountainCourt]
      });
      expect(await screen.findByText('UK Fountain Court Clinic Pharmacy')).toBeInTheDocument();

      await scrollCardsIntoView();

      expect(getPatientAnalytics().track).toHaveBeenCalledWith(
        'Offer Impression',
        expect.anything(),
        expect.objectContaining({ offerType: 'UK Health', offerShown: false })
      );
    });

    test('PINNED (Q12): an unrecognized offer source collides with a None coupon and is deduped', async () => {
      await renderPharmacyPage('ord_q12', {
        prices: 'on',
        nearby: [{ ...couponPharmacy, source: undefined }],
        offers: [
          offer({ id: 'phr_coupon', name: 'Coupon Pharmacy', source: 'NEW_SOURCE', costAmount: 12 })
        ]
      });
      expect(await screen.findByText('Coupon price')).toBeInTheDocument();

      await scrollCardsIntoView();

      expect(offerEvents()).toEqual([['Offer Impression', 'phr_coupon', 'None']]);
    });
  });

  test('an impression fires once per page load across tab switches (Q15)', async () => {
    await renderPharmacyPage('ord_q15', { prices: 'on', nearby: [couponPharmacy] });
    expect(await screen.findByText('Coupon Pharmacy')).toBeInTheDocument();
    await scrollCardsIntoView();

    await openTab(text.delivery);
    await openTab(text.pickUp);
    expect(await screen.findByText('Coupon Pharmacy')).toBeInTheDocument();
    await scrollCardsIntoView();

    expect(offerEvents()).toEqual([['Offer Impression', 'phr_coupon', 'GoodRx']]);
  });

  describe('reroute flow (Q16)', () => {
    const fountainCourtCard = () =>
      screen.findByRole('radio', { name: 'UK Fountain Court Clinic Pharmacy' });

    test('a promoted offer shows when rerouting with prices on', async () => {
      await renderPharmacyPage('ord_q16_on', {
        reroute: true,
        prices: 'on',
        nearby: [currentPharmacy, couponPharmacy],
        offers: [fountainCourt]
      });

      expect(await fountainCourtCard()).toBeInTheDocument();
    });

    test('a promoted offer shows when rerouting with prices off', async () => {
      await renderPharmacyPage('ord_q16_off', {
        reroute: true,
        prices: 'off',
        nearby: [currentPharmacy, plainPharmacy],
        offers: [fountainCourt]
      });

      expect(await fountainCourtCard()).toBeInTheDocument();
    });

    test('a promoted offer shows when rerouting away from a closed pharmacy', async () => {
      await renderPharmacyPage('ord_q16_open_now', {
        reroute: true,
        prices: 'on',
        nearby: [currentPharmacy, couponPharmacy],
        offers: [fountainCourt],
        order: { pharmacy: { ...currentPharmacy, isOpen: false } }
      });

      expect(await fountainCourtCard()).toBeInTheDocument();
    });

    test('a promoted offer shows when rerouting away from that same pharmacy', async () => {
      await renderPharmacyPage('ord_q16_from_offer', {
        reroute: true,
        prices: 'on',
        nearby: [couponPharmacy],
        offers: [fountainCourt],
        order: {
          pharmacy: generatePharmacy({
            id: 'phr_01K7YX6BQ894T8800BZAQSR57S',
            name: 'UK Fountain Court Clinic Pharmacy',
            fulfillmentTypes: ['PICK_UP'] as FulfillmentType[],
            isOpen: true
          })
        }
      });

      expect(await fountainCourtCard()).toBeInTheDocument();
    });
  });

  describe('selections', () => {
    test('PINNED (Q18): selecting a plain card fires None selection events when prices are on', async () => {
      await renderPharmacyPage('ord_q18_plain_on', { prices: 'on', nearby: [plainPharmacy] });
      await selectPharmacy('Plain Pharmacy');

      expect(offerEvents()).toEqual([
        ['Offer Selected', 'phr_plain', 'None'],
        ['Offer Clicked', 'phr_plain', undefined]
      ]);
    });

    test('selecting a plain card fires nothing when prices are off (Q18)', async () => {
      await renderPharmacyPage('ord_q18_plain_off', { prices: 'off', nearby: [plainPharmacy] });
      await selectPharmacy('Plain Pharmacy');

      expect(offerEvents()).toEqual([]);
    });

    test('selecting a promoted offer fires selection events when prices are on (Q18)', async () => {
      await renderPharmacyPage('ord_q18_offer_on', {
        prices: 'on',
        nearby: [plainPharmacy],
        offers: [fountainCourt]
      });
      await selectPharmacy('UK Fountain Court Clinic Pharmacy');

      expect(offerEvents()).toEqual([
        ['Offer Selected', 'phr_01K7YX6BQ894T8800BZAQSR57S', 'UK Health'],
        ['Offer Clicked', 'phr_01K7YX6BQ894T8800BZAQSR57S', undefined]
      ]);
    });

    test('PINNED (Q18): selecting a promoted offer fires nothing when prices are off', async () => {
      await renderPharmacyPage('ord_q18_offer_off', {
        prices: 'off',
        nearby: [plainPharmacy],
        offers: [fountainCourt]
      });
      await selectPharmacy('UK Fountain Court Clinic Pharmacy');

      expect(offerEvents()).toEqual([]);
    });

    test('selecting a card with an offer and a coupon price fires a selection per option (Q19)', async () => {
      await renderPharmacyPage('ord_q19', {
        prices: 'on',
        nearby: [couponPharmacy],
        offers: [
          offer({ id: 'phr_coupon', name: 'Coupon Pharmacy', source: 'ARRIVE', costAmount: 12 })
        ]
      });
      await selectPharmacy('Coupon Pharmacy');

      expect(offerEvents()).toEqual([
        ['Offer Selected', 'phr_coupon', 'Arrive'],
        ['Offer Selected', 'phr_coupon', 'GoodRx'],
        ['Offer Clicked', 'phr_coupon', undefined]
      ]);
    });
  });
});
