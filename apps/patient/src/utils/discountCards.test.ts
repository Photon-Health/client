import { describe, expect, test } from 'vitest';
import { generateDiscountCard, generateOrder } from '../test-utils/generators';
import {
  getCurrentDiscountCard,
  pharmacyAcceptsCoupon,
  withoutUnacceptedCouponPrice
} from './discountCards';

describe('pharmacyAcceptsCoupon', () => {
  test('rejects GoodRx at CVS', () => {
    expect(pharmacyAcceptsCoupon({ pharmacyName: 'CVS Pharmacy', source: 'goodrx' })).toBe(false);
  });

  test('rejects GoodRx at CVS/pharmacy-style names', () => {
    expect(pharmacyAcceptsCoupon({ pharmacyName: 'CVS/pharmacy #1234', source: 'goodrx' })).toBe(
      false
    );
  });

  test('accepts RxSense at CVS', () => {
    expect(pharmacyAcceptsCoupon({ pharmacyName: 'CVS Pharmacy', source: 'rxsense' })).toBe(true);
  });

  test('accepts GoodRx at other pharmacies', () => {
    expect(pharmacyAcceptsCoupon({ pharmacyName: 'Walgreens', source: 'goodrx' })).toBe(true);
  });

  test('does not match cvs inside another word', () => {
    expect(pharmacyAcceptsCoupon({ pharmacyName: 'Encvsta Pharmacy', source: 'goodrx' })).toBe(
      true
    );
  });
});

describe('withoutUnacceptedCouponPrice', () => {
  test('clears the GoodRx price at CVS', () => {
    const pharmacy = { name: 'CVS Pharmacy', price: 12, retailPrice: 40, source: 'goodrx' };
    expect(withoutUnacceptedCouponPrice(pharmacy)).toEqual(
      expect.objectContaining({ price: null, retailPrice: null, source: null })
    );
  });

  test('keeps the RxSense price at CVS', () => {
    const pharmacy = { name: 'CVS Pharmacy', price: 12, retailPrice: 40, source: 'rxsense' };
    expect(withoutUnacceptedCouponPrice(pharmacy)).toBe(pharmacy);
  });
});

describe('getCurrentDiscountCard', () => {
  test('hides a GoodRx card when the order is at CVS', () => {
    const order = generateOrder({
      pharmacy: { id: 'phr_cvs', name: 'CVS Pharmacy' } as any,
      discountCards: [generateDiscountCard({ pharmacyId: 'phr_cvs', source: 'goodrx' })]
    });
    expect(getCurrentDiscountCard(order)).toBeUndefined();
  });

  test('shows an RxSense card when the order is at CVS', () => {
    const order = generateOrder({
      pharmacy: { id: 'phr_cvs', name: 'CVS Pharmacy' } as any,
      discountCards: [generateDiscountCard({ pharmacyId: 'phr_cvs', source: 'rxsense' })]
    });
    expect(getCurrentDiscountCard(order)).toEqual(expect.objectContaining({ source: 'rxsense' }));
  });
});
