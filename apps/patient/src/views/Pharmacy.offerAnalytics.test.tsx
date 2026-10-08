// Pins which cards on the pharmacy page fire offer analytics today ("Offer Impression",
// "Offer Selected", "Offer Clicked"), so changes to that behavior show up as diffs here.
// Tests marked PINNED capture behavior that's in question; see TECH-1040 Q<n>.
// Helpers and fixtures are at the bottom of the file.
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { createMemoryRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import { routeElements } from '../Routes';
import {
  getOrder,
  getPharmacies,
  getPharmaciesByLocation,
  rerouteOrder,
  setOrderPharmacy
} from '../api';
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

describe('Pharmacy page offer analytics', () => {
  afterEach(() => {
    vi.clearAllMocks();
    // confirming an autorouted pharmacy is remembered per order
    localStorage.clear();
  });

  describe('Offer Impression', () => {
    describe('first-time order', () => {
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
          order: { organization: deliveryPharmaciesOrg() }
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
            offers: [arriveOfferAtCouponPharmacy]
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
          expect(await screen.findByText(FOUNTAIN_COURT_NAME)).toBeInTheDocument();

          await scrollCardsIntoView();

          expect(offerEvents()).toEqual([
            ['Offer Impression', FOUNTAIN_COURT_ID, 'UK Health'],
            ['Offer Impression', 'phr_coupon', 'GoodRx']
          ]);
        });

        test('PINNED (Q8): a promoted offer above the tabs fires nothing when prices are off', async () => {
          await renderPharmacyPage('ord_q8_off', {
            prices: 'off',
            nearby: [plainPharmacy],
            offers: [fountainCourt]
          });
          expect(await screen.findByText(FOUNTAIN_COURT_NAME)).toBeInTheDocument();

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
            ['Offer Impression', FOUNTAIN_COURT_ID, 'UK Health'],
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
            offers: [arriveOffer]
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
          expect(await screen.findByText(FOUNTAIN_COURT_NAME)).toBeInTheDocument();

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
              offer({
                id: 'phr_coupon',
                name: 'Coupon Pharmacy',
                source: 'NEW_SOURCE',
                costAmount: 12
              })
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
    });

    describe('reroute via Change pharmacy (Q16)', () => {
      test('a promoted offer fires an impression when rerouting with prices on', async () => {
        await renderPharmacyPage('ord_q16_on', {
          reroute: 'change-pharmacy',
          prices: 'on',
          nearby: [currentPharmacy, couponPharmacy],
          offers: [fountainCourt]
        });

        await scrollCardsIntoView();

        expect(offerEvents()).toEqual([
          ['Offer Impression', FOUNTAIN_COURT_ID, 'UK Health'],
          // the order's current pharmacy is a plain card (Q1)
          ['Offer Impression', 'phr_current', 'None'],
          ['Offer Impression', 'phr_coupon', 'GoodRx']
        ]);
      });

      // desired: the promoted offer still fires its UK Health impression
      test('PINNED (Q16): a promoted offer fires nothing when rerouting with prices off', async () => {
        await renderPharmacyPage('ord_q16_off', {
          reroute: 'change-pharmacy',
          prices: 'off',
          nearby: [currentPharmacy, plainPharmacy],
          offers: [fountainCourt]
        });
        expect(await screen.findByRole('radio', { name: FOUNTAIN_COURT_NAME })).toBeInTheDocument();

        await scrollCardsIntoView();

        expect(offerEvents()).toEqual([]);
      });

      test('a promoted offer fires an impression when rerouting away from a closed pharmacy', async () => {
        await renderPharmacyPage('ord_q16_open_now', {
          reroute: 'change-pharmacy',
          prices: 'on',
          nearby: [currentPharmacy, couponPharmacy],
          offers: [fountainCourt],
          order: { pharmacy: { ...currentPharmacy, isOpen: false } }
        });

        await scrollCardsIntoView();

        expect(offerEvents()).toEqual([
          ['Offer Impression', FOUNTAIN_COURT_ID, 'UK Health'],
          ['Offer Impression', 'phr_current', 'None'],
          ['Offer Impression', 'phr_coupon', 'GoodRx']
        ]);
      });

      test('a promoted offer fires an impression when rerouting away from that same pharmacy', async () => {
        await renderPharmacyPage('ord_q16_from_offer', {
          reroute: 'change-pharmacy',
          prices: 'on',
          nearby: [couponPharmacy],
          offers: [fountainCourt],
          order: { pharmacy: fountainCourtPharmacy }
        });

        await scrollCardsIntoView();

        expect(offerEvents()).toEqual([
          ['Offer Impression', FOUNTAIN_COURT_ID, 'UK Health'],
          ['Offer Impression', 'phr_coupon', 'GoodRx']
        ]);
      });
    });
  });

  describe('Offer Selected and Offer Clicked', () => {
    describe('first-time order', () => {
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

      test('selecting a coupon-priced card fires a selection typed by its source (Q18)', async () => {
        await renderPharmacyPage('ord_q18_coupon_on', { prices: 'on', nearby: [couponPharmacy] });
        await selectPharmacy('Coupon Pharmacy');

        expect(offerEvents()).toEqual([
          ['Offer Selected', 'phr_coupon', 'GoodRx'],
          ['Offer Clicked', 'phr_coupon', undefined]
        ]);
      });

      test('selecting a promoted offer fires selection events when prices are on (Q18)', async () => {
        await renderPharmacyPage('ord_q18_offer_on', {
          prices: 'on',
          nearby: [plainPharmacy],
          offers: [fountainCourt]
        });
        await selectPharmacy(FOUNTAIN_COURT_NAME);

        expect(offerEvents()).toEqual([
          ['Offer Selected', FOUNTAIN_COURT_ID, 'UK Health'],
          ['Offer Clicked', FOUNTAIN_COURT_ID, undefined]
        ]);
      });

      test('PINNED (Q18): selecting a promoted offer fires nothing when prices are off', async () => {
        await renderPharmacyPage('ord_q18_offer_off', {
          prices: 'off',
          nearby: [plainPharmacy],
          offers: [fountainCourt]
        });
        await selectPharmacy(FOUNTAIN_COURT_NAME);

        expect(offerEvents()).toEqual([]);
      });

      test('selecting a delivery offer fires selection events when prices are on (Q18)', async () => {
        await renderPharmacyPage('ord_q18_delivery_on', {
          prices: 'on',
          nearby: [couponPharmacy],
          offers: [amazonDeliveryOffer]
        });
        await openTab(text.delivery);
        await selectPharmacy('Amazon Pharmacy');

        expect(offerEvents()).toEqual([
          ['Offer Selected', 'phr_amazon', 'Amazon Pharmacy'],
          ['Offer Clicked', 'phr_amazon', undefined]
        ]);
      });

      test('PINNED (Q18): selecting a delivery offer fires nothing when prices are off', async () => {
        await renderPharmacyPage('ord_q18_delivery_off', {
          prices: 'off',
          nearby: [plainPharmacy],
          offers: [amazonDeliveryOffer]
        });
        await openTab(text.delivery);
        await selectPharmacy('Amazon Pharmacy');

        expect(offerEvents()).toEqual([]);
      });

      // Offer Clicked only fires for pharmacies in the pickup/offer list, which mail order isn't in
      test('PINNED (Q18): selecting a mail-order card fires a None selection and no click when prices are on', async () => {
        await renderPharmacyPage('ord_q18_mail_on', {
          prices: 'on',
          nearby: [plainPharmacy],
          mailOrder: [mailOrderPharmacy]
        });
        await openTab(text.delivery);
        await selectPharmacy('Mail Pharmacy');

        expect(offerEvents()).toEqual([['Offer Selected', 'phr_mail', 'None']]);
      });

      test('selecting a card with an offer and a coupon price fires a selection per option (Q19)', async () => {
        await renderPharmacyPage('ord_q19', {
          prices: 'on',
          nearby: [couponPharmacy],
          offers: [arriveOfferAtCouponPharmacy]
        });
        await selectPharmacy('Coupon Pharmacy');

        expect(offerEvents()).toEqual([
          ['Offer Selected', 'phr_coupon', 'Arrive'],
          ['Offer Selected', 'phr_coupon', 'GoodRx'],
          ['Offer Clicked', 'phr_coupon', undefined]
        ]);
      });
    });

    describe('reroute via Change pharmacy (Q16)', () => {
      test('PINNED (Q18): selecting a different plain pharmacy fires None selection events when prices are on', async () => {
        await renderPharmacyPage('ord_q16_select_plain_on', {
          reroute: 'change-pharmacy',
          prices: 'on',
          nearby: [currentPharmacy, plainPharmacy]
        });
        await selectPharmacy('Plain Pharmacy');

        expect(offerEvents()).toEqual([
          ['Offer Selected', 'phr_plain', 'None'],
          ['Offer Clicked', 'phr_plain', undefined]
        ]);
      });

      test('selecting a different plain pharmacy fires nothing when prices are off', async () => {
        await renderPharmacyPage('ord_q16_select_plain_off', {
          reroute: 'change-pharmacy',
          prices: 'off',
          nearby: [currentPharmacy, plainPharmacy]
        });
        await selectPharmacy('Plain Pharmacy');

        expect(offerEvents()).toEqual([]);
      });

      test('selecting a promoted offer fires selection events when prices are on', async () => {
        await renderPharmacyPage('ord_q16_select_offer_on', {
          reroute: 'change-pharmacy',
          prices: 'on',
          nearby: [currentPharmacy, couponPharmacy],
          offers: [fountainCourt]
        });
        await selectPharmacy(FOUNTAIN_COURT_NAME);

        expect(offerEvents()).toEqual([
          ['Offer Selected', FOUNTAIN_COURT_ID, 'UK Health'],
          ['Offer Clicked', FOUNTAIN_COURT_ID, undefined]
        ]);
      });

      // desired: the promoted offer selection is tracked
      test('PINNED (Q16): selecting a promoted offer fires nothing when prices are off', async () => {
        await renderPharmacyPage('ord_q16_select_offer_off', {
          reroute: 'change-pharmacy',
          prices: 'off',
          nearby: [currentPharmacy, plainPharmacy],
          offers: [fountainCourt]
        });
        await selectPharmacy(FOUNTAIN_COURT_NAME);

        expect(offerEvents()).toEqual([]);
      });
    });

    describe('reroute from an autorouted ("Sent here") order (Q16)', () => {
      // a confirmation returns before Offer Clicked is tracked (Pharmacy.tsx Confirmation branch)
      test('PINNED (Q16): confirming the Sent here pharmacy fires a None selection and no click', async () => {
        await renderPharmacyPage('ord_q16_confirm_plain', {
          reroute: 'autorouted',
          prices: 'on',
          nearby: [currentPharmacy, couponPharmacy]
        });
        await selectPharmacy('Current Pharmacy');

        expect(offerEvents()).toEqual([['Offer Selected', 'phr_current', 'None']]);
      });

      test('PINNED (Q16): confirming a Sent here promoted offer fires its selection and no click', async () => {
        await renderPharmacyPage('ord_q16_confirm_offer', {
          reroute: 'autorouted',
          prices: 'on',
          nearby: [couponPharmacy],
          offers: [fountainCourt],
          order: { pharmacy: fountainCourtPharmacy }
        });
        await selectPharmacy(FOUNTAIN_COURT_NAME);

        expect(offerEvents()).toEqual([['Offer Selected', FOUNTAIN_COURT_ID, 'UK Health']]);
      });

      test('choosing a promoted offer instead fires selection events when prices are on', async () => {
        await renderPharmacyPage('ord_q16_autorouted_offer_on', {
          reroute: 'autorouted',
          prices: 'on',
          nearby: [currentPharmacy, couponPharmacy],
          offers: [fountainCourt]
        });
        await selectPharmacy(FOUNTAIN_COURT_NAME);

        expect(offerEvents()).toEqual([
          ['Offer Selected', FOUNTAIN_COURT_ID, 'UK Health'],
          ['Offer Clicked', FOUNTAIN_COURT_ID, undefined]
        ]);
      });

      // desired: the promoted offer selection is tracked
      test('PINNED (Q16): choosing a promoted offer instead fires nothing when prices are off', async () => {
        await renderPharmacyPage('ord_q16_autorouted_offer_off', {
          reroute: 'autorouted',
          prices: 'off',
          nearby: [currentPharmacy, plainPharmacy],
          offers: [fountainCourt]
        });
        await selectPharmacy(FOUNTAIN_COURT_NAME);

        expect(offerEvents()).toEqual([]);
      });
    });
  });
});

// ---------------------------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------------------------

const OFFER_EVENTS = ['Offer Impression', 'Offer Selected', 'Offer Clicked'];

// [event, pharmacy id, offerType] for every offer event sent so far, in order
function offerEvents() {
  return vi
    .mocked(getPatientAnalytics().track)
    .mock.calls.filter(([event]) => OFFER_EVENTS.includes(event))
    .map(([event, , properties]) => [
      event,
      properties?.pharmacy_id ?? properties?.pharmacyId,
      properties?.offerType
    ]);
}

interface Scenario {
  // the page only turns prices off when the priced search finds nothing nearby, as for UK orgs
  prices: 'on' | 'off';
  offers?: PharmacyOffer[];
  nearby?: GQLPharmacy[];
  mailOrder?: GQLPharmacy[];
  order?: Partial<Order>;
  // a placed order the patient can move:
  // - 'change-pharmacy': opens on Status and the patient taps "Change pharmacy"
  // - 'autorouted': the system picked its pharmacy, so it opens straight on the pharmacy page
  //   with that pharmacy marked "Sent here" (re-selecting it confirms the order)
  reroute?: 'change-pharmacy' | 'autorouted';
}

// every test needs its own order id: impressions dedupe per order/pharmacy/offerType per page load
async function renderPharmacyPage(
  orderId: string,
  { prices, offers = [], nearby = [], mailOrder = [], order = {}, reroute }: Scenario
) {
  if (prices === 'on' && nearby.length === 0) {
    throw new Error('prices stay on only when the priced search returns a nearby pharmacy');
  }

  vi.mocked(getOrder).mockResolvedValue(
    generateOrder({
      fills: [generateFill('test-treatment')],
      state: 'ROUTING',
      ...(reroute ? reroutableOrder(reroute) : {}),
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
    initialEntries: [`/?orderId=${orderId}&token=${MOCK_TOKEN}`]
  });
  render(<RouterProvider router={router} />);
  if (reroute === 'change-pharmacy') {
    // Status adds openNow to the pharmacy page when the current pharmacy is closed
    await userEvent.click(await screen.findByText(/change pharmacy/i));
  }
  expect(await screen.findByRole('heading', { name: 'Choose a Pharmacy' })).toBeInTheDocument();
}

// picks a card and submits; the submit routes the order, reroutes it, or, when re-selecting
// the order's current pharmacy, confirms it and leaves for Status
async function selectPharmacy(name: string) {
  vi.mocked(setOrderPharmacy).mockResolvedValue(true);
  vi.mocked(rerouteOrder).mockResolvedValue(true);

  await userEvent.click(await screen.findByRole('radio', { name }));
  await userEvent.click(await screen.findByText(text.selectPharmacy));

  await waitFor(() => {
    const submitted =
      vi.mocked(setOrderPharmacy).mock.calls.length > 0 ||
      vi.mocked(rerouteOrder).mock.calls.length > 0 ||
      !screen.queryByRole('heading', { name: 'Choose a Pharmacy' });
    expect(submitted).toBe(true);
  });
}

function openTab(name: string) {
  return userEvent.click(screen.getByRole('tab', { name }));
}

// a placed order the patient is allowed to move
function reroutableOrder(reroute: NonNullable<Scenario['reroute']>): Partial<Order> {
  const placedOrder: Partial<Order> = {
    state: 'PLACED',
    pharmacy: currentPharmacy,
    isReroutable: true,
    fulfillments: [generateFulfillment({ state: 'PROCESSING' })],
    organization: {
      id: 'org_test_defaultId',
      name: 'Test Org',
      settings: { patientUx: { enablePatientRerouting: true } }
    } as Order['organization']
  };

  return reroute === 'autorouted'
    ? // one automatic route and nothing since sends the order to the pharmacy page
      { ...placedOrder, metadata: { routingHistory: [{ selector: 'AUTO' }] } as Order['metadata'] }
    : // an unresolved order error lets "Change pharmacy" skip asking for a reason
      { ...placedOrder, exceptions: [{ exceptionType: 'ORDER_ERROR' }] };
}

function deliveryPharmaciesOrg(): Order['organization'] {
  return {
    id: 'org_test_defaultId',
    name: 'Test Org',
    settings: { patientUx: { enablePatientDeliveryPharmacies: true } }
  } as Order['organization'];
}

function offer({
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
}): PharmacyOffer {
  return {
    source,
    isPromoted,
    pricing: costAmount == null ? {} : { costAmount, costAmountTitle: 'With insurance' },
    pharmacy: { id, name, fulfillmentTypes: [fulfillmentType] },
    tags: [{ kind: 'IN_NETWORK', label: 'In network' }],
    prescriptions: []
  };
}

// ---------------------------------------------------------------------------------------------
// fixtures (only read inside tests, so they can live below them)
// ---------------------------------------------------------------------------------------------

const MOCK_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30';

const FOUNTAIN_COURT_ID = 'phr_01K7YX6BQ894T8800BZAQSR57S';
const FOUNTAIN_COURT_NAME = 'UK Fountain Court Clinic Pharmacy';

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
const currentPharmacy = generatePharmacy({
  id: 'phr_current',
  name: 'Current Pharmacy',
  fulfillmentTypes: ['PICK_UP'] as FulfillmentType[],
  isOpen: true
});
// Fountain Court as the order's pharmacy, for rerouting away from it
const fountainCourtPharmacy = generatePharmacy({
  id: FOUNTAIN_COURT_ID,
  name: FOUNTAIN_COURT_NAME,
  fulfillmentTypes: ['PICK_UP'] as FulfillmentType[],
  isOpen: true
});

// the UK Health strategy builds a static, priceless bundle for its configured pharmacy
const fountainCourt = offer({
  id: FOUNTAIN_COURT_ID,
  name: FOUNTAIN_COURT_NAME,
  source: 'UK_HEALTH',
  isPromoted: true
});
const apothecary = offer({
  id: 'phr_01K7YX6BH8T8EMXQZ5NY69F22V',
  name: 'UK The Apothecary',
  source: 'UK_HEALTH',
  isPromoted: true
});
const arriveOffer = offer({
  id: 'phr_arrive',
  name: 'Arrive Pharmacy',
  source: 'ARRIVE',
  costAmount: 12
});
const arriveOfferAtCouponPharmacy = offer({
  id: 'phr_coupon',
  name: 'Coupon Pharmacy',
  source: 'ARRIVE',
  costAmount: 12
});
const amazonDeliveryOffer = offer({
  id: 'phr_amazon',
  name: 'Amazon Pharmacy',
  source: 'AMAZON_PHARMACY',
  costAmount: 19.99,
  fulfillmentType: 'MAIL_ORDER'
});
