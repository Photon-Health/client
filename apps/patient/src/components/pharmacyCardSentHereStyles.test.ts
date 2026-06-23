import { getPharmacyCardBorderStyle } from './pharmacyCardSentHereStyles';

test('getPharmacyCardBorderStyle returns blue border when pharmacy was autorouted', () => {
  expect(
    getPharmacyCardBorderStyle({
      isAutoroutedPharmacy: true,
      isCurrentPharmacy: false,
      selected: false
    })
  ).toEqual({
    bgColor: 'blue.50',
    borderWidth: '2px',
    borderColor: 'blue.500'
  });
});

test('getPharmacyCardBorderStyle returns grey border when pharmacy is current but not autorouted', () => {
  expect(
    getPharmacyCardBorderStyle({
      isAutoroutedPharmacy: false,
      isCurrentPharmacy: true,
      selected: false
    })
  ).toEqual({
    bgColor: 'gray.200',
    borderWidth: '1px',
    borderColor: 'gray.300'
  });
});

test('getPharmacyCardBorderStyle returns brand border when pharmacy is selected', () => {
  expect(
    getPharmacyCardBorderStyle({
      isAutoroutedPharmacy: false,
      isCurrentPharmacy: false,
      selected: true
    })
  ).toEqual({
    bgColor: 'white',
    borderWidth: '2px',
    borderColor: 'brand.500'
  });
});

test('getPharmacyCardBorderStyle returns grey background with brand border when current pharmacy is selected', () => {
  expect(
    getPharmacyCardBorderStyle({
      isAutoroutedPharmacy: false,
      isCurrentPharmacy: true,
      selected: true
    })
  ).toEqual({
    bgColor: 'gray.200',
    borderWidth: '2px',
    borderColor: 'brand.500'
  });
});

test('getPharmacyCardBorderStyle prioritizes selected styling over autorouted styling', () => {
  expect(
    getPharmacyCardBorderStyle({
      isAutoroutedPharmacy: true,
      isCurrentPharmacy: false,
      selected: true
    })
  ).toEqual({
    bgColor: 'white',
    borderWidth: '2px',
    borderColor: 'brand.500'
  });
});
