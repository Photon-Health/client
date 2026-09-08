import { describe, expect, test } from 'vitest';
import { summarizeOfferBundle } from './offers';
import { PrescriptionOffer } from './models';

const SAME_DAY = 'Same-Day';
const ONE_DAY = 'Delivery in 1 day, after you place your order';
const ONE_TO_TWO_DAY = '1–2 day delivery available, after you place your order';
const TWO_TO_THREE_DAY = 'Delivery in 2–3 days, after you place your order';
const ONE_TO_FOUR_DAY = 'Delivery in 1–4 days, after you place your order';

const RX_COUPON = 'PHARMACY_RX_COUPON';

const buildOffer = ({
  prescriptionId = 'rx_1',
  name = 'Metformin 500mg',
  priceType,
  amount,
  retailAmount,
  promotions,
  deliveryPromise
}: {
  prescriptionId?: string;
  name?: string;
  priceType: 'CASH' | 'MEMBERSHIP' | 'INSURANCE';
  amount?: number;
  retailAmount?: number;
  promotions?: Array<{ type?: string; amount?: number; amountSaved?: number }>;
  deliveryPromise?: string;
}): PrescriptionOffer =>
  ({
    priceType,
    deliveryEstimate: deliveryPromise ? { deliveryPromise } : undefined,
    prescription: { id: prescriptionId, treatment: { id: 'trt_1', name } },
    prescriptionPrice: { amount, retailAmount, promotions }
  } as PrescriptionOffer);

describe('summarizeOfferBundle', () => {
  test('picks the cheapest price per medication independently', () => {
    const summary = summarizeOfferBundle([
      buildOffer({ prescriptionId: 'rx_1', priceType: 'CASH', amount: 20 }),
      buildOffer({ prescriptionId: 'rx_1', priceType: 'MEMBERSHIP', amount: 15 }),
      buildOffer({ prescriptionId: 'rx_2', priceType: 'CASH', amount: 5 }),
      buildOffer({ prescriptionId: 'rx_2', priceType: 'MEMBERSHIP', amount: 30 })
    ]);

    expect(summary.costAmount).toBe(20);
  });

  test('prefers MEMBERSHIP on a tie', () => {
    const summary = summarizeOfferBundle([
      buildOffer({ priceType: 'CASH', amount: 20 }),
      buildOffer({ priceType: 'MEMBERSHIP', amount: 20 })
    ]);

    expect(summary.medications).toEqual([expect.objectContaining({ pricingType: 'MEMBERSHIP' })]);
  });

  test('prefers a priced offer over one with no price', () => {
    const summary = summarizeOfferBundle([
      buildOffer({ priceType: 'MEMBERSHIP', amount: undefined }),
      buildOffer({ priceType: 'CASH', amount: 20 })
    ]);

    expect(summary.costAmount).toBe(20);
  });

  test('leaves the total undefined when no offer has a price', () => {
    const summary = summarizeOfferBundle([buildOffer({ priceType: 'CASH', amount: undefined })]);

    expect(summary.costAmount).toBeUndefined();
  });

  test('costAmountTitle is specific when all medications are MEMBERSHIP', () => {
    const summary = summarizeOfferBundle([buildOffer({ priceType: 'MEMBERSHIP', amount: 20 })]);

    expect(summary.costAmountTitle).toBe('Prime Member Price');
  });

  test('titles the total "Total Price" when medications span price types', () => {
    const summary = summarizeOfferBundle([
      buildOffer({ prescriptionId: 'rx_1', priceType: 'CASH', amount: 5 }),
      buildOffer({ prescriptionId: 'rx_2', priceType: 'MEMBERSHIP', amount: 10 })
    ]);

    expect(summary.costAmountTitle).toBe('Total Price');
  });

  test('excludes insurance offers even when they are the cheapest', () => {
    const summary = summarizeOfferBundle([
      buildOffer({ priceType: 'INSURANCE', amount: 1 }),
      buildOffer({ priceType: 'CASH', amount: 40 })
    ]);

    expect(summary.costAmount).toBe(40);
  });

  test('excludes price when a prescription only has an insurance offer', () => {
    const summary = summarizeOfferBundle([buildOffer({ priceType: 'INSURANCE', amount: 40 })]);

    expect(summary.costAmount).toBeUndefined();
    expect(summary.medications).toEqual([]);
  });

  test('costAmountTitle is specific when all medications are CASH', () => {
    const summary = summarizeOfferBundle([buildOffer({ priceType: 'CASH', amount: 20 })]);

    expect(summary.costAmountTitle).toBe('Cash Price');
  });
});

describe('promotion prices', () => {
  test('uses largest PHARMACY_RX_COUPON amount minus amountSaved for CASH offers', () => {
    const summary = summarizeOfferBundle([
      buildOffer({
        priceType: 'CASH',
        amount: 50,
        retailAmount: 75,
        promotions: [
          { type: RX_COUPON, amount: 5, amountSaved: 2 },
          { type: RX_COUPON, amount: 15, amountSaved: 6 }
        ]
      })
    ]);

    expect(summary.costAmount).toBe(9);
  });

  test('uses PHARMACY_RX_COUPON amount minus amountSaved for MEMBERSHIP offers', () => {
    const summary = summarizeOfferBundle([
      buildOffer({
        priceType: 'MEMBERSHIP',
        amount: 30,
        promotions: [{ type: RX_COUPON, amount: 30, amountSaved: 7 }]
      })
    ]);

    expect(summary.costAmount).toBe(23);
  });

  test('picks cash offer when promotion makes it cheaper than membership ', () => {
    const summary = summarizeOfferBundle([
      buildOffer({
        priceType: 'CASH',
        amount: 40,
        promotions: [{ type: RX_COUPON, amount: 40, amountSaved: 35 }]
      }),
      buildOffer({ priceType: 'MEMBERSHIP', amount: 20 })
    ]);

    expect(summary.costAmount).toBe(5);
    expect(summary.medications).toEqual([expect.objectContaining({ pricingType: 'CASH' })]);
  });

  test('keeps the promotions on the medication line for the coupon tag', () => {
    const summary = summarizeOfferBundle([
      buildOffer({
        priceType: 'CASH',
        amount: 50,
        promotions: [{ type: RX_COUPON, amount: 15, amountSaved: 6 }]
      })
    ]);

    expect(summary.medications).toEqual([
      expect.objectContaining({
        promotions: [{ type: RX_COUPON, amount: 15, amountSaved: 6 }]
      })
    ]);
  });
});

describe('retail amounts', () => {
  test('sums retail amounts across medications in the best-price bundle', () => {
    const summary = summarizeOfferBundle([
      buildOffer({ prescriptionId: 'rx_1', priceType: 'CASH', amount: 10, retailAmount: 20 }),
      buildOffer({ prescriptionId: 'rx_2', priceType: 'CASH', amount: 5, retailAmount: 7 })
    ]);

    expect(summary.retailAmount).toBe(27);
    expect(summary.retailAmountTitle).toBe('Retail');
  });

  test('uses the matching CASH retail amount for MEMBERSHIP rows when available', () => {
    const summary = summarizeOfferBundle([
      buildOffer({ priceType: 'CASH', amount: 25, retailAmount: 55 }),
      buildOffer({ priceType: 'MEMBERSHIP', amount: 18, retailAmount: 999 })
    ]);

    expect(summary.medications).toEqual([
      expect.objectContaining({ pricingType: 'MEMBERSHIP', amount: 18, retailAmount: 55 })
    ]);
  });

  test('uses its own retail amount for MEMBERSHIP rows when there is no CASH offer', () => {
    const summary = summarizeOfferBundle([
      buildOffer({ priceType: 'MEMBERSHIP', amount: 18, retailAmount: 999 })
    ]);

    expect(summary.retailAmount).toBe(999);
  });

  test('preserves existing totals when a medication amount is undefined', () => {
    const summary = summarizeOfferBundle([
      buildOffer({ prescriptionId: 'rx_1', priceType: 'CASH', amount: 10, retailAmount: 20 }),
      buildOffer({ prescriptionId: 'rx_2', priceType: 'CASH' }),
      buildOffer({ prescriptionId: 'rx_3', priceType: 'CASH', amount: 5, retailAmount: 7 })
    ]);

    expect(summary.medications).toHaveLength(3);
    expect(summary.costAmount).toBe(15);
    expect(summary.retailAmount).toBe(27);
  });
});

describe('delivery estimate', () => {
  const withPromises = (...promises: (string | undefined)[]) =>
    summarizeOfferBundle(
      promises.map((deliveryPromise, index) =>
        buildOffer({
          prescriptionId: `rx_${index}`,
          priceType: 'CASH',
          amount: 5,
          deliveryPromise
        })
      )
    ).deliveryEstimate;

  test('picks the slower delivery when promises differ', () => {
    expect(withPromises(ONE_TO_TWO_DAY, TWO_TO_THREE_DAY)).toBe(TWO_TO_THREE_DAY);
  });

  test('picks 1-4 days over 1-2 days', () => {
    expect(withPromises(ONE_TO_TWO_DAY, ONE_TO_FOUR_DAY)).toBe(ONE_TO_FOUR_DAY);
  });

  test('picks a day-range over a same-day promise', () => {
    expect(withPromises(SAME_DAY, ONE_TO_TWO_DAY)).toBe(ONE_TO_TWO_DAY);
  });

  test('picks a single-day promise over a same-day promise', () => {
    expect(withPromises(SAME_DAY, ONE_DAY)).toBe(ONE_DAY);
  });

  test('picks a range over a single-day promise', () => {
    expect(withPromises(ONE_DAY, TWO_TO_THREE_DAY)).toBe(TWO_TO_THREE_DAY);
  });

  test('is undefined when no medication has a delivery promise', () => {
    expect(withPromises(undefined, undefined)).toBeUndefined();
  });
});
