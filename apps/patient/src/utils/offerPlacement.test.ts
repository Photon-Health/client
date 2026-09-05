import { describe, expect, test } from 'vitest';
import { isDeliveryOffer, selectOfferPlacement } from './offerPlacement';
import { OfferBundleComplete } from './models';

const bundle = (overrides: Partial<OfferBundleComplete>): OfferBundleComplete => ({
  pharmacy: { id: 'phr_default', name: 'Pharmacy', fulfillmentTypes: ['MAIL_ORDER'] },
  tags: [],
  ...overrides
});

describe('selectOfferPlacement', () => {
  test('puts all promoted offers above the fold, ordered by source priority', () => {
    const amazon = bundle({
      source: 'AMAZON_PHARMACY',
      isPromoted: true,
      pharmacy: { id: 'phr_amazon', name: 'Amazon', fulfillmentTypes: ['MAIL_ORDER'] }
    });
    const novocare = bundle({
      source: 'NOVOCARE',
      isPromoted: true,
      pharmacy: { id: 'phr_novocare', name: 'Novocare', fulfillmentTypes: ['MAIL_ORDER'] }
    });

    // Input order is Novocare-first; Amazon should still sort ahead of Novocare above the fold.
    const { aboveFold, inTab } = selectOfferPlacement([novocare, amazon]);

    expect(aboveFold.map((o) => o.source)).toEqual(['AMAZON_PHARMACY', 'NOVOCARE']);
    expect(inTab).toHaveLength(0);
  });

  test('puts non-promoted offers in-tab', () => {
    const amazon = bundle({
      source: 'AMAZON_PHARMACY',
      isPromoted: true,
      pharmacy: { id: 'phr_amazon', name: 'Amazon', fulfillmentTypes: ['MAIL_ORDER'] }
    });
    const localPickup = bundle({
      isPromoted: false,
      pharmacy: { id: 'phr_local', name: 'Local', fulfillmentTypes: ['PICK_UP'] }
    });

    const { aboveFold, inTab } = selectOfferPlacement([amazon, localPickup]);

    expect(aboveFold.map((o) => o.pharmacy.id)).toEqual(['phr_amazon']);
    expect(inTab.map((o) => o.pharmacy.id)).toEqual(['phr_local']);
  });

  test('puts no offers above the fold when nothing is promoted', () => {
    const notPromoted = bundle({ source: 'AMAZON_PHARMACY', isPromoted: false });

    const { aboveFold, inTab } = selectOfferPlacement([notPromoted]);

    expect(aboveFold).toHaveLength(0);
    expect(inTab).toHaveLength(1);
  });
});

describe('isDeliveryOffer', () => {
  test('MAIL_ORDER routes to delivery tab', () => {
    expect(
      isDeliveryOffer(
        bundle({ pharmacy: { id: 'p', name: 'P', fulfillmentTypes: ['MAIL_ORDER'] } })
      )
    ).toBe(true);
  });

  test('PICK_UP routes to pickup', () => {
    expect(
      isDeliveryOffer(bundle({ pharmacy: { id: 'p', name: 'P', fulfillmentTypes: ['PICK_UP'] } }))
    ).toBe(false);
  });
});
