import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import {
  clearAutoroutedPharmacyConfirmation,
  hasConfirmedAutoroutedPharmacy,
  markAutoroutedPharmacyConfirmed
} from './autoroutedPharmacyConfirmationStorage';

const orderId = 'ord_test123';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

test('hasConfirmedAutoroutedPharmacy returns false when order has not been confirmed', () => {
  expect(hasConfirmedAutoroutedPharmacy(orderId)).toBe(false);
});

test('markAutoroutedPharmacyConfirmed stores confirmation per order id', () => {
  markAutoroutedPharmacyConfirmed(orderId);

  expect(hasConfirmedAutoroutedPharmacy(orderId)).toBe(true);
  expect(hasConfirmedAutoroutedPharmacy('ord_other')).toBe(false);
});

test('clearAutoroutedPharmacyConfirmation removes stored confirmation', () => {
  markAutoroutedPharmacyConfirmed(orderId);

  clearAutoroutedPharmacyConfirmation(orderId);

  expect(hasConfirmedAutoroutedPharmacy(orderId)).toBe(false);
});

test('hasConfirmedAutoroutedPharmacy returns false when localStorage throws', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('localStorage unavailable');
  });

  expect(hasConfirmedAutoroutedPharmacy(orderId)).toBe(false);
});

test('markAutoroutedPharmacyConfirmed does not throw when localStorage throws', () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('localStorage unavailable');
  });

  expect(() => markAutoroutedPharmacyConfirmed(orderId)).not.toThrow();
});

test('markAutoroutedPharmacyConfirmed leaves confirmation false when localStorage throws', () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('localStorage unavailable');
  });

  markAutoroutedPharmacyConfirmed(orderId);

  expect(hasConfirmedAutoroutedPharmacy(orderId)).toBe(false);
});

test('clearAutoroutedPharmacyConfirmation does not throw when localStorage throws', () => {
  markAutoroutedPharmacyConfirmed(orderId);

  vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
    throw new Error('localStorage unavailable');
  });

  expect(() => clearAutoroutedPharmacyConfirmation(orderId)).not.toThrow();
});
