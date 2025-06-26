import { formatPrice } from './formatters';

test('formatPrice', () => {
  expect(formatPrice(100)).toEqual('$100.00');
});
