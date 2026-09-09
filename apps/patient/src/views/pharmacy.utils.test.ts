import { beforeEach, describe, expect, test, vi } from 'vitest';
import { fetchOfferBundles } from './pharmacy.utils';
import { getOfferBundles } from '../api';
import { GetOfferBundlesForOrderQuery, OfferPriceType } from '../__generated__/graphql';
import { Order } from '../utils/models';

vi.mock('../api', () => ({
  getOfferBundles: vi.fn()
}));

type BundleResponse = GetOfferBundlesForOrderQuery['offerBundles'][number];
type OfferResponse = BundleResponse['offers'][number];

const order = { id: 'ord_1' } as Order;

const AMAZON = {
  id: 'phr_amazon',
  name: 'Amazon Pharmacy',
  logo: 'https://example.com/amazon.png',
  fulfillmentTypes: ['MAIL_ORDER' as const]
};

const NOVOCARE = {
  id: 'phr_novocare',
  name: 'Novocare',
  fulfillmentTypes: ['MAIL_ORDER' as const]
};

const buildOffer = ({
  prescriptionId = 'rx_1',
  name = 'Metformin 500mg',
  priceType,
  amount,
  retailAmount,
  deliveryPromise
}: {
  prescriptionId?: string;
  name?: string;
  priceType: OfferPriceType;
  amount?: number;
  retailAmount?: number;
  deliveryPromise?: string;
}): OfferResponse => ({
  priceType,
  deliveryEstimate: deliveryPromise ? { deliveryPromise } : undefined,
  prescription: { id: prescriptionId, treatment: { id: 'trt_1', name } },
  prescriptionPrice: { amount, retailAmount }
});

const buildBundle = (overrides: Partial<BundleResponse> = {}): BundleResponse => ({
  source: 'AMAZON_PHARMACY',
  isPromoted: true,
  pharmacy: AMAZON,
  attributeTags: [
    { kind: 'SPONSORED', label: 'Sponsored' },
    { kind: 'IN_STOCK', label: 'In Stock' }
  ],
  offers: [],
  ...overrides
});

const mockBundles = (bundles: BundleResponse[]) =>
  vi.mocked(getOfferBundles).mockResolvedValue(bundles);

describe('fetchOfferBundles', () => {
  beforeEach(() => {
    vi.mocked(getOfferBundles).mockReset();
  });

  test('returns no cards when the order has no bundles', async () => {
    mockBundles([]);

    await expect(fetchOfferBundles(order)).resolves.toEqual([]);
  });

  test('returns card with source, pharmacy and attribute tags', async () => {
    mockBundles([buildBundle({ offers: [buildOffer({ priceType: 'CASH', amount: 20 })] })]);

    const [card] = await fetchOfferBundles(order);

    expect(card).toEqual(
      expect.objectContaining({
        source: 'AMAZON_PHARMACY',
        isPromoted: true,
        pharmacy: {
          id: 'phr_amazon',
          name: 'Amazon Pharmacy',
          logo: 'https://example.com/amazon.png',
          fulfillmentTypes: ['MAIL_ORDER']
        },
        tags: [
          { kind: 'SPONSORED', label: 'Sponsored' },
          { kind: 'IN_STOCK', label: 'In Stock' }
        ]
      })
    );
  });

  test('returns one card with several bundles from one pharmacy', async () => {
    mockBundles([
      buildBundle({
        offers: [buildOffer({ prescriptionId: 'rx_1', priceType: 'CASH', amount: 20 })]
      }),
      buildBundle({
        offers: [buildOffer({ prescriptionId: 'rx_2', priceType: 'CASH', amount: 5 })]
      })
    ]);

    const cards = await fetchOfferBundles(order);

    expect(cards).toHaveLength(1);
    // Offers from both bundles are summarized together into one total.
    expect(cards[0].costAmount).toBe(25);
    expect(cards[0].prescriptions).toHaveLength(2);
  });

  test('returns one card per pharmacy', async () => {
    mockBundles([
      buildBundle({ offers: [buildOffer({ priceType: 'CASH', amount: 20 })] }),
      buildBundle({
        source: 'NOVOCARE',
        pharmacy: NOVOCARE,
        attributeTags: [],
        offers: [buildOffer({ priceType: 'CASH', amount: 99 })]
      })
    ]);

    const cards = await fetchOfferBundles(order);

    expect(cards.map((card) => card.pharmacy.id)).toEqual(['phr_amazon', 'phr_novocare']);
  });

  test('does not promote the card when there are 0 promoted bundles', async () => {
    mockBundles([buildBundle({ isPromoted: false })]);

    const [card] = await fetchOfferBundles(order);

    expect(card.isPromoted).toBe(false);
  });

  test('drops a bundle with no pharmacy since it has nothing to render as a card', async () => {
    mockBundles([
      buildBundle({ pharmacy: undefined }),
      buildBundle({ offers: [buildOffer({ priceType: 'CASH', amount: 20 })] })
    ]);

    const cards = await fetchOfferBundles(order);

    expect(cards.map((card) => card.pharmacy.id)).toEqual(['phr_amazon']);
  });

  test('defaults tags to an empty list when the bundle has none', async () => {
    mockBundles([buildBundle({ attributeTags: undefined })]);

    const [card] = await fetchOfferBundles(order);

    expect(card.tags).toEqual([]);
  });

  test('leaves a card priceless when its only bundle is insurance', async () => {
    mockBundles([buildBundle({ offers: [buildOffer({ priceType: 'INSURANCE', amount: 40 })] })]);

    const [card] = await fetchOfferBundles(order);

    expect(card.costAmount).toBeUndefined();
    expect(card.prescriptions).toEqual([]);
  });
});
