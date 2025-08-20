import { Order } from '../utils/models';
import { FillWithCount } from '../utils/general';
import { type Offer, type Pharmacy } from '../__generated__/graphql';

export const generateId = (prefix?: string) => `${prefix}${Math.random().toString(16).slice(2)}`;

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
  dateOfBirth: new Date(),
  sex: 'MALE',
  ...overrides
});

export const generateFill = (treatmentName: string): Order['fills'][number] => ({
  id: `fil_testIdDefault`,
  treatment: {
    id: `med_testIdDefault`,
    name: treatmentName
  }
});

type Fulfillment = Order['fulfillments'][number];
export const generateFulfillment = (overrides: Partial<Fulfillment> = {}): Fulfillment => ({
  id: `ful_testIdDefault`,
  state: 'READY',
  exceptions: [],
  prescription: generatePrescription(),
  ...overrides
});

type Prescription = Fulfillment['prescription'];
export const generatePrescription = (): Prescription => ({
  id: `rx_testIdDefault`,
  dispenseQuantity: 0,
  dispenseUnit: '',
  expirationDate: undefined,
  fillsAllowed: 0,
  treatment: {
    __typename: undefined,
    id: '',
    name: ''
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
