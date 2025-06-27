import { formatPrice } from './formatters';

test('formatPrice', () => {
  expect(formatPrice(100.1)).toEqual('100.10');
  expect(formatPrice(100)).toEqual('100');
});
