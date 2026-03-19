import { expect } from 'vitest';
import { getLatestDelivery } from '../utils/deliveryPromise';

const SAME_DAY = 'Same day';
const ONE_TO_TWO_DAY = 'Delivery in 1–2 days, after you place your order';
const TWO_TO_THREE_DAY = 'Delivery in 2–3 days, after you place your order';
const ONE_TO_FOUR_DAY = 'Delivery in 1–4 days, after you place your order';

test('returns undefined when there are no delivery promises', () => {
  expect(getLatestDelivery([])).toBeUndefined();
});

test('returns same day when that is the only option', () => {
  expect(getLatestDelivery([SAME_DAY])).toBe(SAME_DAY);
});

test('picks the slower delivery when promises differ', () => {
  expect(getLatestDelivery([ONE_TO_TWO_DAY, TWO_TO_THREE_DAY])).toBe(TWO_TO_THREE_DAY);
});

test('picks 1-4 days over 1-2 days', () => {
  expect(getLatestDelivery([ONE_TO_TWO_DAY, ONE_TO_FOUR_DAY])).toBe(ONE_TO_FOUR_DAY);
});

test('picks a day-range over a same-day promise', () => {
  expect(getLatestDelivery([SAME_DAY, ONE_TO_TWO_DAY])).toBe(ONE_TO_TWO_DAY);
});
