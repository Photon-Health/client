import { getPharmacyCardBorderStyle, isPharmacyCardSelectable } from './pharmacyCardSentHereStyles';

test('getPharmacyCardBorderStyle returns blue border when pharmacy was autorouted', () => {
  expect(
    getPharmacyCardBorderStyle({
      isAutoroutedPharmacy: true,
      isPharmacyFulfillingCurrentOrder: false,
      selected: false
    })
  ).toEqual({
    bgColor: 'blue.50',
    borderWidth: '2px',
    borderColor: 'blue.500'
  });
});

test('getPharmacyCardBorderStyle returns grey border when pharmacy is current but not selected', () => {
  expect(
    getPharmacyCardBorderStyle({
      isAutoroutedPharmacy: false,
      isPharmacyFulfillingCurrentOrder: true,
      selected: false
    })
  ).toEqual({
    bgColor: 'gray.200',
    borderWidth: '1px',
    borderColor: 'gray.300'
  });
});

test('getPharmacyCardBorderStyle returns brand border when pharmacy is selected and not current', () => {
  expect(
    getPharmacyCardBorderStyle({
      isAutoroutedPharmacy: false,
      isPharmacyFulfillingCurrentOrder: false,
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
      isPharmacyFulfillingCurrentOrder: true,
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
      isPharmacyFulfillingCurrentOrder: false,
      selected: true
    })
  ).toEqual({
    bgColor: 'white',
    borderWidth: '2px',
    borderColor: 'brand.500'
  });
});

test('isPharmacyCardSelectable returns false when pharmacy is current and not autorouted', () => {
  expect(
    isPharmacyCardSelectable({
      isAutoroutedPharmacy: false,
      isPharmacyFulfillingCurrentOrder: true
    })
  ).toBe(false);
});

test('isPharmacyCardSelectable returns true when pharmacy is autorouted', () => {
  expect(
    isPharmacyCardSelectable({
      isAutoroutedPharmacy: true,
      isPharmacyFulfillingCurrentOrder: false
    })
  ).toBe(true);
});

test('isPharmacyCardSelectable returns true when pharmacy is not current', () => {
  expect(
    isPharmacyCardSelectable({
      isAutoroutedPharmacy: false,
      isPharmacyFulfillingCurrentOrder: false
    })
  ).toBe(true);
});
