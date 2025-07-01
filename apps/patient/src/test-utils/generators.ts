import { Order } from '../utils/models';
import { FillWithCount } from '../utils/general';
import { type Offer, type Pharmacy } from '../__generated__/graphql';

export const generateOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 'ord_test_defaultId',
  patient: generatePatient(),
  organization: {
    id: 'org_test_defaultId',
    name: 'Test Org'
  },
  address: {
    street1: '123 Main St',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: ''
  },
  readyBy: 'Regular',
  state: 'CANCELED',
  isReroutable: false,
  exceptions: [],
  fills: [],
  fulfillments: [],
  discountCards: [],
  ...overrides
});

export const generatePatient = (overrides: Partial<Order['patient']> = {}): Order['patient'] => ({
  id: 'pat_defaultTestId',
  name: { full: 'John Doe' },
  ...overrides
});

export const generateFill = (treatmentName: string): Order['fills'][number] => ({
  id: `fil_testIdDefault`,
  treatment: {
    id: `med_testIdDefault`,
    name: treatmentName
  }
});

export const generateFlattenedFill = (override: Partial<FillWithCount>): FillWithCount => ({
  id: `fil_testIdDefault`,
  count: 1,
  treatment: generateTreatment(),
  ...override
});

export const generateTreatment = (
  override: Partial<FillWithCount['treatment']> = {}
): FillWithCount['treatment'] => ({
  id: 'med_testIdDefault',
  name: 'test-treatment-name',
  ...override
});

export const generateOffer = (overrides: Partial<Offer> = {}): Offer => ({
  supplier: 'UNKNOWN',
  ...overrides
});

export const generateDiscountCard = (
  overrides: Partial<Order['discountCards'][number]> = {}
): Order['discountCards'][number] => ({
  id: '',
  prescriptionId: '',
  price: 0,
  bin: '',
  pcn: '',
  group: '',
  memberId: '',
  pharmacyId: '',
  source: '',
  ...overrides
});

export const generatePharmacy = (overrides: Partial<Pharmacy> = {}): Pharmacy => ({
  id: 'phr_defaultTestId',
  name: 'default-test-pharmacy-name',
  ...overrides
});
