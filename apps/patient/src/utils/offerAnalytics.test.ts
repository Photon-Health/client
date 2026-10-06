import { describe, expect, test } from 'vitest';
import { deriveCostType, getOfferType, toWaysToPay } from './offerAnalytics';
import { EnrichedPharmacy, PharmacyOffer, OfferTypes } from './models';
import { groupOffersByPharmacy } from './offers';

const bundle = (overrides: Partial<PharmacyOffer>): PharmacyOffer => ({
  pharmacy: { id: 'p', name: 'P' },
  tags: [],
  pricing: {},
  ...overrides
});

describe('getOfferType', () => {
  test('keys Amazon off the offer source', () => {
    expect(getOfferType({ offer: bundle({ source: 'AMAZON_PHARMACY' }) })).toBe(
      OfferTypes.AmazonPharmacy
    );
  });

  test('keys Novocare off the offer source', () => {
    expect(getOfferType({ offer: bundle({ source: 'NOVOCARE' }) })).toBe(OfferTypes.Novocare);
  });

  test('keys UK Health off the offer source', () => {
    expect(getOfferType({ offer: bundle({ source: 'UK_HEALTH' }) })).toBe(OfferTypes.UkHealth);
  });

  test('keys GoodRx/RxSense off the pharmacy source', () => {
    expect(getOfferType({ pharmacy: { source: 'goodrx' } as EnrichedPharmacy })).toBe(
      OfferTypes.GoodRx
    );
    expect(getOfferType({ pharmacy: { source: 'rxsense' } as EnrichedPharmacy })).toBe(
      OfferTypes.RxSense
    );
  });

  test('is null when nothing matches', () => {
    expect(getOfferType({})).toBeNull();
  });
});

describe('deriveCostType', () => {
  test('is MIXED when the picked lines span price types', () => {
    const offer = bundle({
      source: 'AMAZON_PHARMACY',
      prescriptions: [{ pricingType: 'CASH' }, { pricingType: 'MEMBERSHIP' }]
    });
    expect(deriveCostType(offer)).toBe('MIXED');
  });

  test('is the single price type when the lines share one', () => {
    const offer = bundle({ source: 'AMAZON_PHARMACY', prescriptions: [{ pricingType: 'CASH' }] });
    expect(deriveCostType(offer)).toBe('CASH');
  });
});

describe('toWaysToPay', () => {
  const offer = (source: string, costAmount?: number) =>
    bundle({ source, pricing: costAmount == null ? {} : { costAmount } });

  test('lists every offer plus the pharmacy coupon price', () => {
    const [offerGroup] = groupOffersByPharmacy([offer('ARRIVE', 12), offer('UK_HEALTH', 30)]);
    const pharmacy = { id: 'p', source: 'goodrx', price: 16.25 } as EnrichedPharmacy;

    expect(toWaysToPay({ pharmacy, offerGroup })).toEqual([
      { source: OfferTypes.Arrive, price: 12 },
      { source: OfferTypes.UkHealth, price: 30 },
      { source: OfferTypes.GoodRx, price: 16.25 }
    ]);
  });

  test('keeps an offer with no price', () => {
    const [offerGroup] = groupOffersByPharmacy([offer('UK_HEALTH')]);

    expect(toWaysToPay({ offerGroup })).toEqual([
      { source: OfferTypes.UkHealth, price: undefined }
    ]);
  });

  // an offer-derived pharmacy carries its offer's price, which isn't a coupon
  test('skips the coupon entry for a pharmacy with no source', () => {
    const [offerGroup] = groupOffersByPharmacy([offer('ARRIVE', 12)]);
    const pharmacy = { id: 'p', price: 12 } as EnrichedPharmacy;

    expect(toWaysToPay({ pharmacy, offerGroup })).toEqual([
      { source: OfferTypes.Arrive, price: 12 }
    ]);
  });
});
