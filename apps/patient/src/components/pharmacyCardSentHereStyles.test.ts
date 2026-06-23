import { getPharmacyCardBorderStyle } from './pharmacyCardSentHereStyles';

test('getPharmacyCardBorderStyle returns blue border when order was sent to pharmacy', () => {
  expect(getPharmacyCardBorderStyle({ isSentHere: true, selected: false })).toEqual({
    bgColor: 'blue.50',
    borderWidth: '2px',
    borderColor: 'blue.500'
  });
});

test('getPharmacyCardBorderStyle returns brand border when pharmacy is selected', () => {
  expect(getPharmacyCardBorderStyle({ isSentHere: false, selected: true })).toEqual({
    bgColor: 'white',
    borderWidth: '2px',
    borderColor: 'brand.500'
  });
});

test('getPharmacyCardBorderStyle prioritizes sent here styling over selected styling', () => {
  expect(getPharmacyCardBorderStyle({ isSentHere: true, selected: true })).toEqual({
    bgColor: 'blue.50',
    borderWidth: '2px',
    borderColor: 'blue.500'
  });
});
