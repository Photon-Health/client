import { formatPrice } from './formatters';

test('formatPrice shows 2 decimal places when there are fractionals', () => {
  expect(formatPrice(100.1)).toEqual('100.10');
});

test('formatPrice hides decimal places for whole numbers', () => {
  expect(formatPrice(100)).toEqual('100');
});
