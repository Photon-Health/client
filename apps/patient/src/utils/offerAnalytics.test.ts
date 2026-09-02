import { describe, expect, test } from 'vitest';
import { deriveCostType, getOfferType } from './offerAnalytics';
import { EnrichedPharmacy, OfferBundleComplete, OfferTypes } from './models';

const bundle = (overrides: Partial<OfferBundleComplete>): OfferBundleComplete => ({
  pharmacy: { id: 'p', name: 'P' },
  tags: [],
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
      medications: [{ pricingType: 'CASH' }, { pricingType: 'MEMBERSHIP' }]
    });
    expect(deriveCostType(offer)).toBe('MIXED');
  });

  test('is the single price type when the lines share one', () => {
    const offer = bundle({ source: 'AMAZON_PHARMACY', medications: [{ pricingType: 'CASH' }] });
    expect(deriveCostType(offer)).toBe('CASH');
  });
});
